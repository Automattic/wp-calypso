import { fetchCurrentSiteUser, deleteSiteUser } from '../../data/site-users';
import { queryClient } from '../query-client';
import { createSiteBySlugQueryFilter } from './site';

export const siteCurrentUserQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'users', 'current' ],
	queryFn: () => fetchCurrentSiteUser( siteId ),
} );

export function siteUserDeleteMutation( siteId: number ) {
	return {
		mutationFn: ( userId: number ) => deleteSiteUser( siteId, userId ),
		onSuccess: () => {
			queryClient.invalidateQueries( createSiteBySlugQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		},
	};
}
