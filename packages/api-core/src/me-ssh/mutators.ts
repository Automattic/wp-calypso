import { wpcom } from '../wpcom-fetcher';
import type { CreateSshKeyArgs, UpdateSshKeyArgs, UpdateSshKeyLabelArgs } from './types';

export async function createSshKey( data: CreateSshKeyArgs ) {
	return wpcom.req.post(
		{
			path: '/me/ssh-keys',
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}

export async function updateSshKey( { name, key }: UpdateSshKeyArgs ) {
	return wpcom.req.put(
		{
			path: `/me/ssh-keys/${ encodeURIComponent( name ) }`,
			apiNamespace: 'wpcom/v2',
		},
		{ key }
	);
}

export async function updateSshKeyLabel( { name, label }: UpdateSshKeyLabelArgs ) {
	return wpcom.req.put(
		{
			path: `/me/ssh-keys/${ encodeURIComponent( name ) }`,
			apiNamespace: 'wpcom/v2',
		},
		{ label }
	);
}

export async function deleteSshKey( name: string ) {
	return wpcom.req.post( {
		path: `/me/ssh-keys/${ encodeURIComponent( name ) }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}
