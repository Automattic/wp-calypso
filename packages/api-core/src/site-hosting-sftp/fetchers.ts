import { wpcom } from '../wpcom-fetcher';
import type { SftpUser } from './types';

export async function fetchSftpUsers( siteId: number ): Promise< SftpUser[] > {
	const { users } = await wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/ssh-users`,
		apiNamespace: 'wpcom/v2',
	} );

	return users.map( ( username: string ) => ( {
		username,
	} ) );
}
