import { saveSiteMigrationApplicationPassword } from '@automattic/api-core';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../site-migration-credentials/types';

interface StoreApplicationPasswordResponse {
	success: boolean;
}

interface StoreApplicationPasswordPayload {
	password: string;
	username: string;
	source: string;
}

const useStoreApplicationPassword = ( siteSlug: string ) => {
	return useMutation< StoreApplicationPasswordResponse, ApiError, StoreApplicationPasswordPayload >(
		{
			mutationFn: ( { password, username, source } ) =>
				saveSiteMigrationApplicationPassword( siteSlug, { password, username, from_url: source } ),
		}
	);
};

export default useStoreApplicationPassword;
