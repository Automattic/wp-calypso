import { fetchCurrentSiteUser, deleteSiteUser } from '../../data/site-users';

export const siteCurrentUserQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'users', 'current' ],
	queryFn: () => fetchCurrentSiteUser( siteId ),
} );

export function siteUserDeleteMutation( siteId: string ) {
	return {
		mutationFn: ( userId: number ) => deleteSiteUser( siteId, userId ),
	};
}
