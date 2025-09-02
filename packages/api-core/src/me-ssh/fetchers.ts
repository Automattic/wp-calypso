import { wpcom } from '../wpcom-fetcher';
import type { UserSshKey } from './types';

export async function fetchSshKeys(): Promise< UserSshKey[] > {
	return wpcom.req.get( {
		path: '/me/ssh-keys',
		apiNamespace: 'wpcom/v2',
	} );
}
