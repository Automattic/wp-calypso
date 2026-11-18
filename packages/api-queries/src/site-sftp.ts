import {
	fetchSftpUsers,
	createSftpUser,
	deleteSftpUser,
	resetSftpPassword,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteSshAccessStatusQuery } from './site-ssh';
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
		meta: { statId: 'site-sftp-users-create' },
		mutationFn: () => createSftpUser( siteId ),
		onSuccess: ( createdSftpUser ) => {
			queryClient.setQueryData( siteSftpUsersQuery( siteId ).queryKey, ( currentSftpUsers ) =>
				updateCurrentSftpUsers( currentSftpUsers, createdSftpUser )
			);
		},
	} );

export const siteSftpUsersResetPasswordMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-sftp-users-pw-reset' },
		mutationFn: ( sshUsername: string ) => resetSftpPassword( siteId, sshUsername ),
		onSuccess: ( updatedSftpUser ) => {
			queryClient.setQueryData( siteSftpUsersQuery( siteId ).queryKey, ( currentSftpUsers ) =>
				updateCurrentSftpUsers( currentSftpUsers, updatedSftpUser )
			);
		},
	} );

export const siteSftpUsersDeleteMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-sftp-users-delete' },
		mutationFn: ( sshUsername: string ) => deleteSftpUser( siteId, sshUsername ),
		onSuccess: ( _data, deletedUsername ) => {
			queryClient.setQueryData( siteSftpUsersQuery( siteId ).queryKey, ( currentSftpUsers ) =>
				currentSftpUsers?.filter( ( { username } ) => username !== deletedUsername )
			);
			// The endpoint turns SSH access off when it removes the last SFTP user.
			queryClient.invalidateQueries( { queryKey: siteSshAccessStatusQuery( siteId ).queryKey } );
		},
	} );
