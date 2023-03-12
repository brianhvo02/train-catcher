import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { RefObject } from 'react';
import { useGeographic } from 'ol/proj';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Map, View } from 'ol';

const ba_api_key = process.env.NEXT_PUBLIC_BA_API_KEY;
const tl_api_key = process.env.NEXT_PUBLIC_TL_API_KEY;
const operator = 'BA';
const operator_onestop_id = 'o-9q9-bart';
const gtfsrt_fetcher = (endpoint: string) => fetch(`https://api.511.org/transit${endpoint}`).then((res) => res.arrayBuffer()).then((buffer) => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)));
export const transitland_fetcher = (endpoint: string) => fetch(`https://transit.land/api/v2/rest${endpoint}`, {
    headers: {
        'apikey': tl_api_key!
    }
}).then((res) => res.json());


export function useStop(stop_id: string | Function) {
    return useSWRImmutable(`/stops?stop_id=${stop_id}`, transitland_fetcher);
}

export function useAllStops(after: number) {
	return useSWRImmutable(`/stops?served_by_onestop_ids=${operator_onestop_id}&after${after}`, transitland_fetcher);
}

export function useRT() {
    return useSWR(`/tripupdates?api_key=${ba_api_key}&agency=${operator}`, gtfsrt_fetcher, { refreshInterval: 60000 });
}

export function useMap(mapRef: RefObject<HTMLDivElement>) {
    useGeographic();
	const {data: map} = useSWRImmutable(mapRef.current!, (key) => new Map({
		target: key,
		layers: [
		  new TileLayer({
			source: new OSM(),
		  })
		],
		view: new View({
		  center: [-122.11470605828778, 37.677199491141045],
		  zoom: 16,
		}),
	}))
	// if (mapFunction) mapFunction(map);
	return map;
}
