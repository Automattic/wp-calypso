import { AdminBarResponse } from '../admin-bar/types';
import { wpcom } from '../wpcom-fetcher';

export async function fetchSiteAdminBar( siteId: number ): Promise< AdminBarResponse > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/admin-bar`,
		apiNamespace: 'wpcom/v2',
	} );
}
