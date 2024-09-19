import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import wp from 'calypso/lib/wp';

function useSiteRolesQuery( siteId, queryOptions = {} ) {
	const translate = useTranslate();

	return useQuery( {
		queryKey: [ 'site-roles', siteId ],
		queryFn: () => wp.req.get( `/sites/${ siteId }/roles` ),
		...queryOptions,
		select: ( { roles } ) => {
			return roles.map( ( role ) =>
				role.name === 'subscriber' ? { ...role, display_name: translate( 'Viewer' ) } : role
			);
		},
		enabled: !! siteId,
	} );
}

export default useSiteRolesQuery;
