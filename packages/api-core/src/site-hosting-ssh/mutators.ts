import { wpcom } from '../wpcom-fetcher';
import type { SshAccessStatus } from './types';

export async function enableSshAccess( siteId: number ): Promise< SshAccessStatus > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/ssh-access`,
			apiNamespace: 'wpcom/v2',
		},
		{ setting: 'ssh' }
	);
}

export async function disableSshAccess( siteId: number ): Promise< SshAccessStatus > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/ssh-access`,
			apiNamespace: 'wpcom/v2',
		},
		{ setting: 'sftp' }
	);
}

export async function attachSiteSshKey( siteId: number, name: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/ssh-keys`,
			apiNamespace: 'wpcom/v2',
		},
		{ name }
	);
}

export async function detachSiteSshKey( siteId: number, userLogin: string, name: string ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/ssh-keys/${ userLogin }/${ name }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}
