import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

function useSiteRolesQuery( siteId, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'site-roles', siteId ],
		queryFn: () => wp.req.get( `/sites/${ siteId }/roles` ),
		...queryOptions,
		select: ( { roles } ) => {
			return roles.map( ( role ) =>
				role.name === 'subscriber' ? { ...role, display_name: 'Viewer' } : role
			);
		},
		enabled: !! siteId,
	} );
}

export default useSiteRolesQuery;
