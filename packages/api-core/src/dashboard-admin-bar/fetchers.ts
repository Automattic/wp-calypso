import { AdminBarResponse } from '../admin-bar/types';
import { wpcom } from '../wpcom-fetcher';

export async function fetchDashboardAdminBar(): Promise< AdminBarResponse > {
	return wpcom.req.get( {
		path: '/dashboard/admin-bar',
		apiNamespace: 'wpcom/v2',
	} );
}
