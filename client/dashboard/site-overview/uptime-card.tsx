import { useLoaderData } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { connection } from '@wordpress/icons';
import OverviewCard, { OverviewCardProgressBar } from './overview-card';
import type { FetchSiteRouteResponse } from '../data/types';
import './style.scss';

export default function UptimeCard() {
	const { siteMonitorUptime } = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
	if ( ! siteMonitorUptime ) {
		return;
	}
	const { upDays, downDays } = Object.entries( siteMonitorUptime || {} ).reduce(
		( accumulator, [ , { status } = {} as { status: 'up|down' } ] ) => {
			accumulator[ status === 'up' ? 'upDays' : 'downDays' ] += 1;
			return accumulator;
		},
		{ upDays: 0, downDays: 0 }
	);
	const uptimePercentage = Math.round( ( ( upDays / ( upDays + downDays ) ) * 1000 ) / 10 );
	return (
		<>
			<OverviewCard
				title={ __( 'Uptime' ) }
				icon={ connection }
				heading={
					/* translators: %s: percentage of site uptime. Eg. 99% */
					sprintf( __( '%s%%' ), uptimePercentage )
				}
				metaText={ __( 'Past 30 days' ) }
			>
				<OverviewCardProgressBar value={ uptimePercentage } />
			</OverviewCard>
		</>
	);
}
