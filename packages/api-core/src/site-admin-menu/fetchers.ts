import { AdminMenuItem, AdminMenuResponse } from '../admin-menu/types';
import { wpcom } from '../wpcom-fetcher';

export async function fetchSiteAdminMenu( siteId: number ): Promise< AdminMenuItem[] > {
	const response: AdminMenuResponse = await wpcom.req.get(
		{
			path: `/sites/${ siteId }/admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		{ _locale: 'user' }
	);

	return Array.isArray( response ) ? response : response.menu ?? [];
}
