import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
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
			mutationFn: ( { password, username, source } ) => {
				return wpcom.request( {
					path: `/sites/${ siteSlug }/automated-migration/application-passwords`,
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					body: {
						password,
						username,
						from_url: source,
					},
				} );
			},
		}
	);
};

export default useStoreApplicationPassword;
