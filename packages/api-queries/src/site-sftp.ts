import {
	fetchSftpUsers,
	createSftpUser,
	deleteSftpUsers,
	resetSftpPassword,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteSshAccessStatusQuery, siteSshKeysQuery } from './site-ssh';
import type { SftpUser } from '@automattic/api-core';

export const siteSftpUsersQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'sftp-users' ],
		queryFn: () => fetchSftpUsers( siteId ),
		// WP Cloud's user list can lag a few seconds behind an add or delete, so a refetch right after one (on
		// window focus, say) could bring back a user that is gone.
		staleTime: 10 * 1000,
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
		mutationFn: () => deleteSftpUsers( siteId ),
		onSuccess: () => {
			queryClient.setQueryData( siteSftpUsersQuery( siteId ).queryKey, [] );
		},
		onSettled: ( _data, error ) => {
			// After a failure some users may already be gone. After a success the list stays empty as set above.
			if ( error ) {
				queryClient.invalidateQueries( { queryKey: siteSftpUsersQuery( siteId ).queryKey } );
			}
			// The endpoint also turns SSH access off and detaches the site's SSH keys.
			queryClient.invalidateQueries( { queryKey: siteSshAccessStatusQuery( siteId ).queryKey } );
			queryClient.invalidateQueries( { queryKey: siteSshKeysQuery( siteId ).queryKey } );
		},
	} );
