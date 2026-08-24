import { wpcom } from '../wpcom-fetcher';
import type { LegacyContact } from './types';

export async function addLegacyContact( email: string, notes?: string ): Promise< LegacyContact > {
	return wpcom.req.post(
		{
			path: '/me/legacy-contacts',
			apiNamespace: 'wpcom/v2',
		},
		{ email, ...( notes && { notes } ) }
	);
}

export async function deleteLegacyContact( legacyContactId: number ): Promise< void > {
	return wpcom.req.post( {
		path: `/me/legacy-contacts/${ legacyContactId }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}
