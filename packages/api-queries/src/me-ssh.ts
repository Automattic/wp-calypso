import { fetchSshKeys, createSshKey, updateSshKey, deleteSshKey } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const sshKeysQuery = () =>
	queryOptions( {
		queryKey: [ 'ssh-keys' ],
		queryFn: fetchSshKeys,
		retry: false, // Don't retry on 401 errors
		meta: {
			persist: false,
		},
	} );

export const createSshKeyMutation = () =>
	mutationOptions( {
		meta: { statId: 'ssh-key-create' },
		mutationFn: createSshKey,
		onSuccess: () => {
			queryClient.invalidateQueries( sshKeysQuery() );
		},
	} );

export const updateSshKeyMutation = () =>
	mutationOptions( {
		meta: { statId: 'ssh-key-update' },
		mutationFn: updateSshKey,
		onSuccess: () => {
			queryClient.invalidateQueries( sshKeysQuery() );
		},
	} );

export const deleteSshKeyMutation = () =>
	mutationOptions( {
		meta: { statId: 'ssh-key-delete' },
		mutationFn: deleteSshKey,
		onSuccess: () => {
			queryClient.invalidateQueries( sshKeysQuery() );
		},
	} );
