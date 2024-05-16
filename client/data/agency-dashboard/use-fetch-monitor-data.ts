import { useQuery } from '@tanstack/react-query';
import {
	AllowedMonitorPeriods,
	MonitorUptimeAPIResponse,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import wpcom from 'calypso/lib/wp';

const useFetchMonitorData = ( siteId: number | string, period: AllowedMonitorPeriods ) => {
	return useQuery( {
		queryKey: [ 'jetpack-monitor-uptime', siteId, period ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/sites/${ siteId }/jetpack-monitor-uptime`,
					apiNamespace: 'wpcom/v2',
				},
				{
					period,
				}
			),
		select: ( data: MonitorUptimeAPIResponse ) => {
			if ( ! data ) {
				return [];
			}
			// Use sort() to ensure the data is always in ascending order
			// since Object.keys() method does not guarantee the order of the keys.
			const sortedKeys = Object.keys( data ).sort();
			return sortedKeys.map( ( date ) => ( {
				date,
				...data[ date ],
			} ) );
		},
	} );
};

export default useFetchMonitorData;
