import { wpcom } from '../wpcom-fetcher';
import type { CreateSshKeyArgs } from './types';

export async function createSshKey( data: CreateSshKeyArgs ) {
	return wpcom.req.post(
		{
			path: '/me/ssh-keys',
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}

export async function updateSshKey( key: string ) {
	return wpcom.req.put(
		{
			path: '/me/ssh-keys/default',
			apiNamespace: 'wpcom/v2',
		},
		{ key }
	);
}

export async function deleteSshKey() {
	return wpcom.req.post( {
		path: '/me/ssh-keys/default',
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}
