

import { Feature } from 'ol';
import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Point } from 'ol/geom.js';
import { transitland_fetcher, useMap } from '@/common';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';
import useSWRInfinite from 'swr/infinite'
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import BaseLayer from 'ol/layer/Base.js';
import { useRouter } from 'next/router.js';

const operator_onestop_id = 'o-9q9-bart';
const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && previousPageData.stops.length < 20) return null;
    if (pageIndex === 0) return `/stops?served_by_onestop_ids=${operator_onestop_id}`;
    return `/stops?served_by_onestop_ids=${operator_onestop_id}&after=${previousPageData.meta.after}`
}

const layers: BaseLayer[] = [
    new TileLayer({
        source: new OSM(),
    })
];

export default function BARTStops() {
    const { agency_id } = useRouter().query;
    const [done, setDone] = useState(false);
    const [updateMap, setUpdateMap] = useState(true);
    const [highlight, setHighlight] = useState(0);
    const mapRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapRef);

    const { data, size, setSize } = useSWRInfinite(getKey, transitland_fetcher, {
        revalidateFirstPage: false,
        revalidateAll: false
    });

    function update(next: boolean) {
        if (next) {
            if (data && data[data.length - 1].stops.length == 20) setSize(size + 1);
            else return;
        } else {
            if (size > 1) setSize(size - 1);
            else return;
        }
        setUpdateMap(true);
    }

    useEffect(() => {
        if (map && !done) {
            map.getView().adjustZoom(-5.5);
            map.on('click', function (event) {
                const feature = map.getFeaturesAtPixel(event.pixel)[0];
                if (!feature) {
                    return;
                }

                setHighlight(feature.getProperties().name);
            });
            setDone(true);
        }
    }, [map, done])

    useEffect(() => {
        if (map && data && updateMap) {
            if (map.getLayers().getLength() < data.length + 1) {
                const features = data[data.length - 1].stops.map((stop: any) => {
                    const name = stop.id;
                    const coordinates = stop.geometry.coordinates;
                    return new Feature({
                        geometry: new Point(coordinates),
                        name,
                    })
                });
                const layer = new VectorLayer({
                    source: new VectorSource({
                        features: features
                    }),
                    style: {
                        'circle-radius': 5,
                        'circle-fill-color': 'blue',
                    },
                });
                layers.push(layer);
            }
            layers.forEach((layer, index) => {
                if (index == 0 || index == data.length) layer.setVisible(true);
                else layer.setVisible(false);
            });
            map.setLayers(layers);
            setUpdateMap(false);
        }
    }, [map, data]);

	return (
        <main className={styles.container}>
            <div ref={mapRef} className={styles.map}></div>
            {
                data && data[size - 1] ? (
                    <div className={styles.list}>
                        { data[size - 1].stops.map((stop: any) => <Link key={stop.id} style={stop.id == highlight ? {color: 'green'} : {}} href={`/${agency_id}/stops/${stop.stop_id}`}>{stop.stop_name}</Link>) }
                        <div className={styles.buttons}>
                            <button onClick={() => update(false)} hidden={size == 1}>Prev Page</button>
                            <button onClick={() => update(true)}>Next Page</button>
                        </div>
                    </div>
                ) : <p>Loading...</p>
            }
        </main>
    );
}
