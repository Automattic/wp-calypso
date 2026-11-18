import { wpcom } from '../wpcom-fetcher';
import type { SftpUser } from './types';

export async function createSftpUser( siteId: number ): Promise< SftpUser > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/ssh-user`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteSftpUser( siteId: number, sshUsername: string ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/ssh-user/${ sshUsername }`,
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
