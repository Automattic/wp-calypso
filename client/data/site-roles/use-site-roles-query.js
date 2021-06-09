/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

function useSiteRolesQuery( siteId, queryOptions = {} ) {
	return useQuery( [ 'site-roles', siteId ], () => wp.req.get( `/sites/${ siteId }/roles` ), {
		...queryOptions,
		select: ( { roles } ) => roles,
		enabled: !! siteId,
	} );
}

export default useSiteRolesQuery;
