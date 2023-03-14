
import 'ol/ol.css';
import { useAgency, useRoutes } from '@/common';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';
import { useRouter } from 'next/router.js';

export default function BARTLines() {
    const { agency_id } = useRouter().query;
    const { data: agency_data } = useAgency(agency_id as string);
    const { data: route_data } = useRoutes(agency_data ? agency_data.agencies[0].onestop_id : null);
    console.log(route_data)
	return (
        <main className={styles.container}>
            {
                agency_data && route_data? (
                    <div className={styles.list} style={{textAlign: 'center'}}>
                        { route_data.routes.map((route: any) => <Link key={route.id} href={`/${agency_id}/lines/${route.route_short_name}`}>{route.route_short_name} - {route.route_long_name}</Link>) }
                    </div>
                ) : <p>Loading...</p>
            }
        </main>
    );
}
