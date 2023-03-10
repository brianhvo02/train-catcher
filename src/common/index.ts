import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { RefObject } from 'react';
import { useGeographic } from 'ol/proj';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Map, View } from 'ol';

const gtfsrt_fetcher = (url: string) => fetch(url).then((res) => res.arrayBuffer()).then((buffer) => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)));
const api_key = process.env.NEXT_PUBLIC_API_KEY;
const operator = 'BA';

export function useStop() {
    return useSWRImmutable(`https://api.511.org/transit/stops?api_key=${api_key}&operator_id=${operator}`, (url) => fetch(url).then((res) => res.json()));
}
export function useRT() {
    return useSWR(`https://api.511.org/transit/tripupdates?api_key=${api_key}&agency=${operator}`, gtfsrt_fetcher, { refreshInterval: 60000 });
}

export function useMap(mapRef: RefObject<HTMLDivElement>) {
    useGeographic();
    return useSWRImmutable(mapRef.current!, (key) => {
        return new Map({
            target: key,
            layers: [
              new TileLayer({
                source: new OSM(),
              })
            ],
            view: new View({
              center: [-122.11470605828778, 37.577199491141045],
              zoom: 16,
            }),
          });
    });
}
