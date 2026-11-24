import { wpcom } from '../wpcom-fetcher';
import type { SftpUser, SftpUsersDeleteResult } from './types';

export async function createSftpUser( siteId: number ): Promise< SftpUser > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/ssh-user`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteSftpUsers( siteId: number ): Promise< SftpUsersDeleteResult > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/ssh-users`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}

export async function resetSftpPassword(
	siteId: number,
	sshUsername: string
): Promise< SftpUser > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/ssh-user/${ sshUsername }/reset-password`,
		apiNamespace: 'wpcom/v2',
	} );
}
