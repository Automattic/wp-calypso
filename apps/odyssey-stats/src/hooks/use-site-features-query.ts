import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { createSiteFeaturesObject } from 'calypso/state/sites/features/assembler';

/**
 * The site's plan features, in the shape `state.sites.features` holds them.
 * @param siteId  The site to query.
 * @param enabled Whether to ask at all.
 */
export default function useSiteFeaturesQuery( siteId: number, enabled: boolean ) {
	return useQuery( {
		queryKey: [ 'stats-widget', 'site-features', siteId ],
		queryFn: () => wpcom.req.get( `/sites/${ siteId }/features` ),
		select: ( data ) => createSiteFeaturesObject( { ...data } ),
		enabled,
		staleTime: 5 * 60 * 1000,
		// A missing answer leaves every stat open, so there is nothing worth retrying for.
		retry: false,
	} );
}
