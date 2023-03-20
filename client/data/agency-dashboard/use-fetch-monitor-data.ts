import moment from 'moment';
import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const useFetchMonitorData = ( siteId: number ) => {
	return useQuery(
		[ 'jetpack-monitor-incidents', siteId ],
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/jetpack-monitor-incidents`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			select: () => {
				const dates = new Array( 20 );
				for ( let i = 0; i < dates.length; i++ ) {
					dates[ i ] = moment().subtract( i, 'days' ).format( 'YYYY-MM-DDTHH:mm:ss.000[Z]' );
				}
				return {
					incidents: dates.map( ( date, index ) => ( {
						date,
						// eslint-disable-next-line no-nested-ternary
						status: index < 10 ? 'down' : index < 15 ? 'up' : 'no-data',
						total_downtime: 305,
					} ) ),
				};
			},
		}
	);
};

export default useFetchMonitorData;
