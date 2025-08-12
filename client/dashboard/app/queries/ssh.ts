import { queryOptions } from '@tanstack/react-query';
import { fetchSshKeys } from '../../data/me-ssh';

export const sshKeysQuery = () =>
	queryOptions( {
		queryKey: [ 'ssh-keys' ],
		queryFn: fetchSshKeys,
		retry: false, // Don't retry on 401 errors
		meta: {
			persist: false,
		},
	} );
