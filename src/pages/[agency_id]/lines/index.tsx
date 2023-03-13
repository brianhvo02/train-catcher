
import 'ol/ol.css';
import { transitland_fetcher } from '@/common';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';
import useSWRImmutable from 'swr/immutable'
import { useRouter } from 'next/router.js';

export default function BARTLines() {
    const { agency_id } = useRouter().query;
    const { data: agency_data } = useSWRImmutable(`/agencies/365193`, transitland_fetcher);

	return (
        <main className={styles.container}>
            {
                agency_data ? (
                    <div className={styles.list} style={{textAlign: 'center'}}>
                        { agency_data.agencies[0].routes.map((route: any) => <Link key={route.id} href={`/${agency_id}/lines/${route.route_short_name}`}>{route.route_short_name} - {route.route_long_name}</Link>) }
                    </div>
                ) : <p>Loading...</p>
            }
        </main>
    );
}
