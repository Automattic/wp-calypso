import { wpcom } from '../wpcom-fetcher';
import type { LegacyContact, LegacyContactWithAccessKey } from './types';

export async function fetchLegacyContacts(): Promise< LegacyContact[] > {
	return wpcom.req.get( {
		path: '/me/legacy-contacts',
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchLegacyContact(
	legacyContactId: number
): Promise< LegacyContactWithAccessKey > {
	return wpcom.req.get( {
		path: `/me/legacy-contacts/${ legacyContactId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
