
import { Feature } from 'ol';
import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Point } from 'ol/geom.js';
import { useRouter } from 'next/router.js';
import { useStop, useMap, transitland_fetcher } from '@/common';
import styles from '@/styles/Home.module.css';
import useSWR from 'swr';
import Link from 'next/link.js';

interface StopInfo {
    id: string;
    stop_id: string;
    name: string;
    coordinates: [number, number];
}

export default function BARTStop() {
    const { agency_id, stop_id } = useRouter().query;
    const [stopInfo, setStopInfo] = useState<StopInfo>({
        id: "",
        stop_id: stop_id as string,
        name: "loading...",
        coordinates: [0, 0],
    });
    
    const mapRef = useRef<HTMLDivElement>(null);

    const { data: stop_data } = useSWR(() => `/stops/f-sf~bay~area~rg:${stop_id}/departures`, transitland_fetcher)
    const map = useMap(mapRef);

    useEffect(() => {
        if (stop_data && map && map.getAllLayers().length == 1) {
            const coordinates = stop_data.stops[0].geometry.coordinates;
    
            setStopInfo({
                id: stop_data.stops[0].id,
                stop_id: stop_data.stops[0].stop_id,
                name: stop_data.stops[0].stop_name,
                coordinates: stop_data.stops[0].geometry.coordinates,
            });

            map.getView().setCenter(coordinates);
            map.addLayer(
                new VectorLayer({
                    source: new VectorSource({
                        features: [
                            new Feature({
                                geometry: new Point(coordinates)
                            })
                        ]
                    }),
                    style: {
                      'circle-radius': 5,
                      'circle-fill-color': 'blue',
                    },
                }),
            );
        }
    }, [stop_data, map]);

    console.log(stop_data)

	return (
        <main className={styles.container}>
            <div ref={mapRef} className={styles.map}></div>
            <div className={styles.list}>
                <h1>{stopInfo.name}</h1>
                <p>Stop ID: {stopInfo.stop_id}</p>
                <table className={styles.trains}>
                    <thead>
                        <tr>
                            <th>Line</th>
                            <th>Train</th>
                            <th>Estimated Departure</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            stop_data ? stop_data.stops[0].departures.filter((departure: any) => departure.departure.estimated_utc).map((departure: any, i: number) => {
                                return (
                                    <tr key={i.toString()}>
                                        <td><Link href={`/${agency_id}/lines/${departure.trip.route.route_short_name}`}>{departure.trip.route.route_short_name}</Link></td>
                                        <td><Link href={`/${agency_id}/lines/${departure.trip.route.route_short_name}`}>{departure.trip.trip_headsign}</Link></td>
                                        <td>{new Date(departure.departure.estimated_utc).toLocaleTimeString()}</td>
                                    </tr>
                                );
                            }) : <tr><td colSpan={4}>Loading...</td></tr>
                        }
                    </tbody>
                </table>
            </div>
        </main>
    );
}
