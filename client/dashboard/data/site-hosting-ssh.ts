import wpcom from 'calypso/lib/wp';

export interface SshAccessStatus {
	setting: 'sftp' | 'ssh';
}

export interface SiteSshKey {
	sha256: string;
	user_login: string;
	name: string;
	attached_at: string;
}

export async function fetchSshAccessStatus( siteId: string ): Promise< SshAccessStatus > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/ssh-access`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function enableSshAccess( siteId: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/ssh-access`,
			apiNamespace: 'wpcom/v2',
		},
		{ setting: 'ssh' }
	);
}

export async function disableSshAccess( siteId: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/ssh-access`,
			apiNamespace: 'wpcom/v2',
		},
		{ setting: 'sftp' }
	);
}

export async function fetchSiteSshKeys( siteId: string ): Promise< SiteSshKey[] > {
	const { ssh_keys } = await wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/ssh-keys`,
		apiNamespace: 'wpcom/v2',
	} );

	return ssh_keys;
}

export async function attachSiteSshKey( siteId: string, name: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/ssh-keys`,
			apiNamespace: 'wpcom/v2',
		},
		{ name }
	);
}

export async function detachSiteSshKey( siteId: string, userLogin: string, name: string ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/ssh-keys/${ userLogin }/${ name }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}
