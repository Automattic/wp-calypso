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
		mutationFn: async ( sshUsernames: string[] ) => {
			// One at a time: the endpoint turns SSH access off when it removes the last SFTP user.
			for ( const sshUsername of sshUsernames ) {
				await deleteSftpUser( siteId, sshUsername );
			}
		},
		onSuccess: ( _data, deletedUsernames ) => {
			queryClient.setQueryData( siteSftpUsersQuery( siteId ).queryKey, ( currentSftpUsers ) =>
				currentSftpUsers?.filter( ( { username } ) => ! deletedUsernames.includes( username ) )
			);
		},
		onSettled: ( _data, error ) => {
			// After a failure some users may already be gone. After a success the list is left as
			// set above: it can lag behind a delete for a few seconds.
			if ( error ) {
				queryClient.invalidateQueries( { queryKey: siteSftpUsersQuery( siteId ).queryKey } );
			}
			// The last removal turns SSH access off.
			queryClient.invalidateQueries( { queryKey: siteSshAccessStatusQuery( siteId ).queryKey } );
		},
	} );
