import styles from '@/styles/Home.module.css';

import { useState } from "react";
import { useRT } from '@/common';
import TripRowStop from '@/common/trip_row_stop';
import Link from 'next/link';
import { useRouter } from 'next/router.js';

function timestampToDate(timestamp: number) {
	return new Date(timestamp * 1000).toLocaleTimeString();
}

export default function BARTTrips() {
	const { agency_id } = useRouter().query;

	const [ stopId, setStopId ] = useState("");
	const { data: rt_data } = useRT(agency_id as string);

	return (
		<main className={styles.container_home}>
			<p>Last Updated: {timestampToDate(rt_data?.header.timestamp as number)}</p>
			<label>
				Filter by line:
				&nbsp;
				<input type="text" onChange={e => setStopId(e.currentTarget.value)} />
			</label>
			<table className={styles.trains} aria-label="Trains Table">
				<thead>
					<tr>
						<th>Train ID</th>
						<th>Line Name</th>
						<th>Stop Name</th>
						<th>Departure Time</th>
					</tr>
				</thead>
				<tbody>
				{
					rt_data ? rt_data.entity.filter(entity => entity.tripUpdate?.trip.routeId && entity.tripUpdate?.trip.routeId?.toLowerCase().includes(stopId.toLowerCase()) && entity.tripUpdate?.stopTimeUpdate!.length != 0 && entity.tripUpdate?.stopTimeUpdate![0].arrival?.time).map((entity, i) => {
						return (
							<tr key={i.toString()}>
								<td>{entity.id}</td>
								<td>
									<Link href={`/${agency_id}/lines/${entity.tripUpdate?.trip?.routeId}`}>{entity.tripUpdate?.trip?.routeId}</Link>
								</td>
								<td>
									<TripRowStop agency_id={agency_id as string} stop_id={entity.tripUpdate?.stopTimeUpdate![0].stopId!} />
								</td>
								<td>{timestampToDate(entity.tripUpdate?.stopTimeUpdate![0].departure?.time as number)}</td>
							</tr>
						)
					}
					) : <tr><td colSpan={4}>Loading...</td></tr>
				}
				</tbody>
			</table>
		</main>
	);
}
