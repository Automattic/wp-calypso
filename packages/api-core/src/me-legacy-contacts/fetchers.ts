import { wpcom } from '../wpcom-fetcher';
import type { LegacyContact } from './types';

export async function fetchLegacyContacts(): Promise< LegacyContact[] > {
	return wpcom.req.get( {
		path: '/me/legacy-contacts',
		apiNamespace: 'wpcom/v2',
	} );
}
