import { fetchSftpUsers, createSftpUser, resetSftpPassword } from '../../data/site-hosting-sftp';
import { queryClient } from '../query-client';
import type { SftpUser } from '../../data/site-hosting-sftp';

export const siteSftpUsersQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'sftp-users' ],
	queryFn: () => fetchSftpUsers( siteId ),
	meta: {
		persist: false,
	},
} );

const updateCurrentSftpUsers = ( currentSftpUsers: SftpUser[], sftpUser: SftpUser ) => {
	const index = currentSftpUsers.findIndex(
		( currentSftpUser ) => currentSftpUser.username === sftpUser.username
	);
	if ( index >= 0 ) {
		return [ ...currentSftpUsers.slice( 0, index ), sftpUser, ...currentSftpUsers.slice( 0 + 1 ) ];
	}

	return [ ...currentSftpUsers, sftpUser ];
};

export const siteSftpUsersCreateMutation = ( siteId: number ) => ( {
	mutationFn: () => createSftpUser( siteId ),
	onSuccess: ( createdSftpUser: SftpUser ) => {
		queryClient.setQueryData(
			siteSftpUsersQuery( siteId ).queryKey,
			( currentSftpUsers: SftpUser[] ) =>
				updateCurrentSftpUsers( currentSftpUsers, createdSftpUser )
		);
	},
} );

export const siteSftpUsersResetPasswordMutation = ( siteId: number ) => ( {
	mutationFn: ( sshUsername: string ) => resetSftpPassword( siteId, sshUsername ),
	onSuccess: ( updatedSftpUser: SftpUser ) => {
		queryClient.setQueryData(
			siteSftpUsersQuery( siteId ).queryKey,
			( currentSftpUsers: SftpUser[] ) =>
				updateCurrentSftpUsers( currentSftpUsers, updatedSftpUser )
		);
	},
} );
