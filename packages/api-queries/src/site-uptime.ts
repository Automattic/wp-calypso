import { fetchSiteUptime } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteUptimeQuery = ( siteId: number, period?: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'uptime', period ],
		queryFn: () => fetchSiteUptime( siteId, period ),
		select: ( uptime ) => {
			// Post-process the data to calculate total number for up and down days during the time period.
			const { upDays, downDays } = Object.values( uptime ).reduce(
				( accumulator, { status } ) => {
					if ( status === 'monitor_inactive' ) {
						return accumulator;
					}

					accumulator[ status === 'up' ? 'upDays' : 'downDays' ] += 1;
					return accumulator;
				},
				{ upDays: 0, downDays: 0 }
			);

			if ( ! upDays && ! downDays ) {
				return undefined;
			}

			// Calculate the uptime percentage.
			return Math.round( ( upDays / ( upDays + downDays ) ) * 1000 ) / 10;
		},
	} );
