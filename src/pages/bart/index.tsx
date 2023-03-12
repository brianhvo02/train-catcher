import Head from 'next/head';
import styles from '@/styles/Home.module.css';

import { useState } from "react";
import { useRT } from '@/common';
import BARTTripRowStop from '@/common/bart/bart_trip_row_stop';

function timestampToDate(timestamp: number) {
	return new Date(timestamp * 1000).toLocaleString();
}

export default function BARTTrips() {
	const [ stopId, setStopId ] = useState("");
	const { data: rt_data } = useRT();
	if (!rt_data) return <>Loading...</>;
	console.log(rt_data)

	return (
		<>
			<Head>
				<title>Train Catcher</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main>
				<p>Last Updated: {new Date(parseInt(rt_data?.header.timestamp?.toString() + "000")).toLocaleString()}</p>
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
									<td>{entity.tripUpdate?.trip?.routeId}</td>
									<td>
										<BARTTripRowStop stop_id={entity.tripUpdate?.stopTimeUpdate![0].stopId!} />
									</td>
									<td>{timestampToDate(entity.tripUpdate?.stopTimeUpdate![0].departure?.time as number)}</td>
								</tr>
							)
						}
						) : <></>
					}
					</tbody>
				</table>
			</main>
		</>
	);
}
