import { wpcom } from '../wpcom-fetcher';
import type { LegacyContact } from './types';

export async function addLegacyContact( email: string ): Promise< LegacyContact > {
	return wpcom.req.post(
		{
			path: '/me/legacy-contacts',
			apiNamespace: 'wpcom/v2',
		},
		{ email }
	);
}
