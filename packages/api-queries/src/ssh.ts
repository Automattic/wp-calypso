import { fetchSshKeys } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const sshKeysQuery = () =>
	queryOptions( {
		queryKey: [ 'ssh-keys' ],
		queryFn: fetchSshKeys,
		retry: false, // Don't retry on 401 errors
		meta: {
			persist: false,
		},
	} );
