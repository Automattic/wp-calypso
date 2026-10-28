import { wpcom } from '../wpcom-fetcher';
import type { CreateSshKeyArgs, UpdateSshKeyArgs } from './types';

export async function createSshKey( data: CreateSshKeyArgs ) {
	return wpcom.req.post(
		{
			path: '/me/ssh-keys',
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}

export async function updateSshKey( { name, key, label }: UpdateSshKeyArgs ) {
	return wpcom.req.put(
		{
			path: `/me/ssh-keys/${ encodeURIComponent( name ) }`,
			apiNamespace: 'wpcom/v2',
		},
		{
			...( key !== undefined && { key } ),
			...( label !== undefined && { label } ),
		}
	);
}

export async function deleteSshKey( name: string ) {
	return wpcom.req.post( {
		path: `/me/ssh-keys/${ encodeURIComponent( name ) }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}
