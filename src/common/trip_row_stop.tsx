import Link from 'next/link';
import { useStop } from '@/common';

export default function TripRowStop(props: { agency_id: string, feed_id: string, stop_id: string }) {
	const { data: stop_data } = useStop(props.feed_id, props.stop_id);
	if (!stop_data) return <>Loading...</>;

	return (
		<Link href={`/${props.agency_id}/stops/${props.stop_id}`}>
			{stop_data ? stop_data.stops[0].stop_name : "Loading..."}
		</Link>
	);
}
