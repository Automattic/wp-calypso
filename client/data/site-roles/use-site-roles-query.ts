import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { SiteRolesResponseSchema } from './schema';

function useSiteRolesQuery( siteId: string | number, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'site-roles', siteId ],
		queryFn: async () => {
			const response = await wp.req.get( `/sites/${ siteId }/roles` );
			return SiteRolesResponseSchema.parse( response );
		},
		...queryOptions,
		select: ( { roles } ) => {
			return roles.map( ( role ) =>
				role.name === 'subscriber' ? { ...role, display_name: 'Viewer' } : role
			);
		},
		enabled: !! siteId,
		staleTime: 60 * 1000,
	} );
}

export default useSiteRolesQuery;
