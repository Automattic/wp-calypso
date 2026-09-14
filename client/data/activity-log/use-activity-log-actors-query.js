import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';

const transformActors = ( apiResponse ) =>
	( apiResponse?.actors ?? [] )
		.filter( ( actor ) => actor?.id )
		.map( ( actor ) => ( {
			key: actor.id,
			name: actor.name || actor.id,
			count: actor.count,
		} ) );

// The actors endpoint feeds the "Performed by" dropdown, so it should
// reflect every actor active in the date window — not narrow down to the
// current actor selection. Forward only the date-range fields and key the
// cache on the same, mirroring `ActivityTypeSelector`.
export default function useActivityLogActorsQuery( siteId, filter, options ) {
	const dateRangeFilter = {
		before: filter?.before,
		after: filter?.after,
		on: filter?.on,
		dateRange: filter?.dateRange,
	};
	return useQuery( {
		queryKey: [ 'activity-log-actors', siteId, dateRangeFilter ],
		queryFn: () =>
			wpcom.req
				.get(
					{ path: `/sites/${ siteId }/activity/actors`, apiNamespace: 'wpcom/v2' },
					filterStateToApiQuery( dateRangeFilter, false )
				)
				.then( transformActors ),
		enabled: !! siteId,
		staleTime: 10 * 1000,
		...options,
	} );
}
