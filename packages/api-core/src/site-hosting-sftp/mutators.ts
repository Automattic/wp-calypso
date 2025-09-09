import { wpcom } from '../wpcom-fetcher';
import type { SftpUser } from './types';

export async function createSftpUser( siteId: number ): Promise< SftpUser > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/ssh-user`,
		apiNamespace: 'wpcom/v2',
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
