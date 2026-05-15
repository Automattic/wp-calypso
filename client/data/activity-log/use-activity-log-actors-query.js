import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';
import { getFilterKey } from './utils';

const transformActors = ( apiResponse ) =>
	( apiResponse?.actors ?? [] )
		.filter( ( actor ) => actor?.id )
		.map( ( actor ) => ( {
			key: actor.id,
			name: actor.name || actor.id,
			count: actor.count,
		} ) );

export default function useActivityLogActorsQuery( siteId, filter, options ) {
	return useQuery( {
		queryKey: [ 'activity-log-actors', siteId, getFilterKey( filter ) ],
		queryFn: () =>
			wpcom.req
				.get(
					{ path: `/sites/${ siteId }/activity/actors`, apiNamespace: 'wpcom/v2' },
					filterStateToApiQuery( filter, false )
				)
				.then( transformActors ),
		enabled: !! siteId,
		staleTime: 10 * 1000,
		...options,
	} );
}
