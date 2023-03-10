import Head from 'next/head';
import { Feature } from 'ol';
import { useRef } from 'react';
import 'ol/ol.css';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Point } from 'ol/geom.js';
import { Coordinate } from 'ol/coordinate.js';
import { useStop, useMap } from '@/common';

export default function BARTStop() {
    const mapRef = useRef<HTMLDivElement>(null);
    const { data: stop_data } = useStop();
    const { data: map } = useMap(mapRef);

    if (stop_data && map && map.getAllLayers().length == 1) {
        map.addLayer(
            new VectorLayer({
                source: new VectorSource({
                    features: stop_data["Contents"]["dataObjects"]["ScheduledStopPoint"].map((stop: any) =>
                        new Feature({
                            geometry: new Point(
                                Object.values(
                                    stop['Location']
                                ).map(x => parseFloat(x as string)) as Coordinate
                            ),
                            name: stop['Name']
                        })
                    )
                }),
                style: {
                  'circle-radius': 5,
                  'circle-fill-color': 'red',
                },
            }),
        );

        map.on('click', function (event) {
            const feature = map.getFeaturesAtPixel(event.pixel)[0];
            if (!feature) {
                return;
            }
            console.log(feature.getProperties())
        });
    }

	return (
        <>
            <Head>
                <title>Train Catcher</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div ref={mapRef} style={{ height: "1000px", width: "2000px"}}></div>
            </main>
        </>
    );
}
