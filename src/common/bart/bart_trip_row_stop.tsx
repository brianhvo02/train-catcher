import { Link } from '@nextui-org/react';
import { useStop } from '@/common';

export default function BARTTripRowStop(props: { stop_id: string }) {
	const { data: stop_data } = useStop(props.stop_id);
	if (!stop_data) return <>Loading...</>;

	return (
		<>
            <Link href={`/bart/stops/${props.stop_id}`}>
                {stop_data ? stop_data.stops[0].stop_name : "Loading..."}
            </Link>
        </>
	);
}
