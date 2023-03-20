import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { SiteId } from 'calypso/types';
import { USE_STAGING_SITE_QUERY_KEY } from './use-staging-site';

interface UseDeleteStagingSiteOptions {
	stagingSiteId: SiteId;
	onSuccess?: () => void;
	onError?: () => void;
}

export const useDeleteStagingSite = ( options: UseDeleteStagingSiteOptions ) => {
	const { stagingSiteId, onSuccess, onError } = options;
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const mutation = useMutation(
		() => {
			return wpcom.req.post( {
				method: 'DELETE',
				path: `/sites/${ stagingSiteId }/staging-site`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		{
			onSuccess: async () => {
				dispatch( fetchAutomatedTransferStatus( stagingSiteId ) );
				await queryClient.invalidateQueries( [ USE_STAGING_SITE_QUERY_KEY ] );
				onSuccess?.();
			},
			onError: () => {
				onError?.();
			},
		}
	);
	const { mutate, isLoading } = mutation;

	return { deleteStagingSite: mutate, isLoading };
};
