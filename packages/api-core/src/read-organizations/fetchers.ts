import { wpcom } from '../wpcom-fetcher';
import type { ReaderOrganizationsResponse } from './types';

export async function fetchReaderOrganizations(): Promise< ReaderOrganizationsResponse > {
	return wpcom.req.get( {
		path: '/read/organizations',
		apiVersion: '1.2',
	} );
}
