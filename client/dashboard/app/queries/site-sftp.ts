import { fetchSftpUsers, createSftpUser, resetSftpPassword } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import type { SftpUser } from '@automattic/api-core';

export const siteSftpUsersQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'sftp-users' ],
		queryFn: () => fetchSftpUsers( siteId ),
		meta: {
			persist: false,
		},
	} );

const updateCurrentSftpUsers = ( currentSftpUsers: SftpUser[] | undefined, sftpUser: SftpUser ) => {
	if ( ! currentSftpUsers ) {
		return [ sftpUser ];
	}

	const index = currentSftpUsers.findIndex(
		( currentSftpUser ) => currentSftpUser.username === sftpUser.username
	);
	if ( index >= 0 ) {
		return [ ...currentSftpUsers.slice( 0, index ), sftpUser, ...currentSftpUsers.slice( 0 + 1 ) ];
	}

	return [ ...currentSftpUsers, sftpUser ];
};

export const siteSftpUsersCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => createSftpUser( siteId ),
		onSuccess: ( createdSftpUser ) => {
			queryClient.setQueryData( siteSftpUsersQuery( siteId ).queryKey, ( currentSftpUsers ) =>
				updateCurrentSftpUsers( currentSftpUsers, createdSftpUser )
			);
		},
	} );

export const siteSftpUsersResetPasswordMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( sshUsername: string ) => resetSftpPassword( siteId, sshUsername ),
		onSuccess: ( updatedSftpUser ) => {
			queryClient.setQueryData( siteSftpUsersQuery( siteId ).queryKey, ( currentSftpUsers ) =>
				updateCurrentSftpUsers( currentSftpUsers, updatedSftpUser )
			);
		},
	} );
