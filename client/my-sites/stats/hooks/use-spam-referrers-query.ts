import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

interface SpamReferrer {
	domain: string;
}

interface SpamReferrersResponse {
	domains: SpamReferrer[];
}

const QUERY_KEY_BASE = 'stats-spam-referrers';

const fetchSpamReferrers = ( siteId: number ): Promise< SpamReferrersResponse > =>
	wpcom.req.get( { path: `/sites/${ siteId }/stats/referrers/spam`, apiVersion: '1.1' } );

export default function useSpamReferrersQuery( siteId: number | null ) {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ QUERY_KEY_BASE, siteId ],
		queryFn: () => fetchSpamReferrers( siteId as number ),
		enabled: !! siteId,
		staleTime: 0,
	} );
}

export function useUnspamReferrerMutation( siteId: number | null ) {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( domain: string ) => {
			const wpcomSite = wpcom.site( siteId );
			return wpcomSite.statsReferrersSpamDelete( domain );
		},
		onMutate: async ( domain ) => {
			// Cancel any outgoing refetches so they don't overwrite our optimistic update.
			await queryClient.cancelQueries( { queryKey: [ QUERY_KEY_BASE, siteId ] } );

			// Snapshot the previous value for rollback.
			const previous = queryClient.getQueryData< SpamReferrersResponse >( [
				QUERY_KEY_BASE,
				siteId,
			] );

			// Optimistically remove the domain from the cached list.
			queryClient.setQueryData< SpamReferrersResponse >( [ QUERY_KEY_BASE, siteId ], ( old ) => {
				if ( ! old ) {
					return { domains: [] };
				}
				return {
					domains: old.domains.filter( ( item ) => item.domain !== domain ),
				};
			} );

			return { previous };
		},
		onError: ( _error, _domain, context ) => {
			// Roll back to the previous value on error.
			if ( context?.previous ) {
				queryClient.setQueryData( [ QUERY_KEY_BASE, siteId ], context.previous );
			}
		},
		retry: 1,
		retryDelay: 3 * 1000,
	} );
}
