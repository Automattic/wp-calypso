import { fetchCurrentSiteUser, deleteSiteUser } from '../../data/site-users';

export const siteCurrentUserQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'users', 'current' ],
	queryFn: () => fetchCurrentSiteUser( siteId ),
} );

export function siteUserDeleteMutation( siteId: number ) {
	return {
		mutationFn: ( userId: number ) => deleteSiteUser( siteId, userId ),
	};
}
