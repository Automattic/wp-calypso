import { wpcom } from '../wpcom-fetcher';
import type { SshAccessStatus, SiteSshKey } from './types';

export async function fetchSshAccessStatus( siteId: number ): Promise< SshAccessStatus > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/ssh-access`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchSiteSshKeys( siteId: number ): Promise< SiteSshKey[] > {
	const { ssh_keys } = await wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/ssh-keys`,
		apiNamespace: 'wpcom/v2',
	} );

	return ssh_keys;
}
