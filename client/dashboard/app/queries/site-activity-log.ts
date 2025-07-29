import { queryOptions } from '@tanstack/react-query';
import { fetchSiteActivityLog } from '../../data/site-activity-log';

export const siteLastFiveActivityLogEntriesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', 'last-five' ],
		queryFn: () => fetchSiteActivityLog( siteId, { number: 5 } ),
		select: ( data ) => data.current?.orderedItems?.slice( 0, 5 ) ?? [],
	} );
