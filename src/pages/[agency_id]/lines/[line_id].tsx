
import { Feature } from 'ol';
import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Point } from 'ol/geom.js';
import { useRouter } from 'next/router.js';
import { useStop, useMap, transitland_fetcher } from '@/common';
import styles from '@/styles/Home.module.css';
import useSWRImmutable from 'swr/immutable';
import GeoJSON from 'ol/format/GeoJSON';
import Link from 'next/link.js';

export default function BARTLine() {
    const { agency_id, line_id } = useRouter().query;
    
    const [done, setDone] = useState(false);
    const [routeInfo, setRouteInfo] = useState<any>(null);
    const [highlight, setHighlight] = useState(0);

    const mapRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapRef);

    const { data: route_data } = useSWRImmutable(() => `/routes/f-sf~bay~area~rg:BA:${line_id}.geojson`, transitland_fetcher);

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
        if (route_data && map && map.getAllLayers().length == 1) {
            const properties = route_data.features[0].properties;
            setRouteInfo(properties);
            delete route_data.features[0].properties;
            map.addLayer(
                new VectorLayer({
                    source: new VectorSource({
                        features: new GeoJSON().readFeatures(route_data)
                    }),
                    style: {
                      'stroke-width': 5,
                      'stroke-color': 'green',
                    },
                })
            );
            map.addLayer(
                new VectorLayer({
                    source: new VectorSource({
                        features: properties.route_stops.map((stop: any) => {
                            const name = stop.stop.id;
                            const coordinates = stop.stop.geometry.coordinates;
                            return new Feature({
                                geometry: new Point(coordinates),
                                name,
                            });
                        })
                    }),
                    style: {
                      'circle-radius': 5,
                      'circle-fill-color': 'blue',
                    },
                }),
            )
        }
    }, [route_data, map]);

	return (
        <main className={styles.container}>
            <div ref={mapRef} className={styles.map}></div>
            {
                route_data && routeInfo ? (
                    <div className={styles.list}>
                        <h1>{routeInfo.route_long_name}</h1> 
                        <p>Route ID: {routeInfo.route_short_name}</p>
                        {
                            routeInfo.route_stops.map((stop: any) => <Link key={stop.stop.id} style={stop.stop.id == highlight ? {color: 'green'} : {}} href={`/${agency_id}/stops/${stop.stop.stop_id}`}>{stop.stop.stop_name}</Link>)
                        }
                    </div>
                ) : <p>Loading...</p>
            }
                
            
        </main>
    );
}
