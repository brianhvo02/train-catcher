import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { RefObject } from 'react';
import { useGeographic } from 'ol/proj';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite from 'swr/infinite'
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Map, View } from 'ol';

const ba_api_key = process.env.NEXT_PUBLIC_BA_API_KEY;
const tl_api_key = process.env.NEXT_PUBLIC_TL_API_KEY;

const gtfsrt_fetcher = (endpoint: string) => fetch(`https://api.511.org/transit${endpoint}`).then((res) => res.arrayBuffer()).then((buffer) => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)));
export const transitland_fetcher = (endpoint: string) => fetch(`https://transit.land/api/v2/rest${endpoint}`, {
    headers: {
        'apikey': tl_api_key!
    }
}).then((res) => res.json());

const getKey = (agency_onestop_id: string, pageIndex: number, previousPageData: any) => {
	if (!agency_onestop_id) return null;
    if (previousPageData && previousPageData.stops.length < 20) return null;
    if (pageIndex === 0) return agency_onestop_id ? `/stops?served_by_onestop_ids=${agency_onestop_id}` : null;
    return `/stops?served_by_onestop_ids=${agency_onestop_id}&after=${previousPageData.meta.after}`
}

export function useStops(agency_onestop_id: string) {
	return useSWRInfinite((pageIndex, previousPageData) => getKey(agency_onestop_id, pageIndex, previousPageData), transitland_fetcher, {
        revalidateFirstPage: false,
        revalidateAll: false,
    });
}

export function useRoutes(agency_onestop_id: string) {
	return useSWRImmutable(agency_onestop_id ? `/routes?operator_onestop_id=${agency_onestop_id}` : null, transitland_fetcher);
}

export function useLine(feed_id: string, agency_id: string, line_id: string) {
	return useSWRImmutable(feed_id && agency_id && line_id ? `/routes/${feed_id}:${agency_id}:${line_id}.geojson` : null, transitland_fetcher);
}

export function useAgency(agency_id: string) {
	return useSWRImmutable(agency_id ? `/agencies?agency_id=${agency_id}` : null, transitland_fetcher);
}

export function useStop(feed_id: string, stop_id: string) {
    return useSWRImmutable(feed_id && stop_id ? `/stops?stop_key=${feed_id}:${stop_id}` : null, transitland_fetcher);
}

export function useRT(agency_id: string) {
	return useSWR(agency_id ? `/tripupdates?api_key=${ba_api_key}&agency=${agency_id}` : null, gtfsrt_fetcher, { refreshInterval: 60000 });
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
	return map;
}