import { useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

interface HasSeenWhatsNewModal {
	hasSeenWhatsNewModal: boolean;
}

interface HasSeenWhatsNewModalResult {
	has_seen_whats_new_modal: boolean;
}

interface UpdateError {
	message: string;
	error: string;
}

export const useHasSeenWhatsNewModalQuery = ( siteId: number | null ) => {
	const queryKey = 'has-seen-whats-new-modal';

	const { data, isLoading } = useQuery< { has_seen_whats_new_modal: boolean } >(
		queryKey,
		async () =>
			await wpcomRequest( {
				path: `/sites/${ siteId }/block-editor/has-seen-whats-new-modal`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
		}
	);

	const queryClient = useQueryClient();
	const mutation = useMutation< HasSeenWhatsNewModalResult, UpdateError, HasSeenWhatsNewModal >(
		async ( { hasSeenWhatsNewModal } ) =>
			await wpcomRequest( {
				path: `/sites/${ siteId }/block-editor/has-seen-whats-new-modal`,
				apiNamespace: 'wpcom/v2',
				method: 'post',
				body: {
					has_seen_whats_new_modal: hasSeenWhatsNewModal,
				},
			} ),
		{
			onSuccess( data ) {
				queryClient.setQueryData( queryKey, {
					...data,
				} );
			},
		}
	);

	const { mutate } = mutation;

	const setHasSeenWhatsNewModal = useCallback(
		( hasSeenWhatsNewModal: boolean ) => {
			mutate( { hasSeenWhatsNewModal } );
		},
		[ mutate ]
	);

	return {
		data,
		isLoading,
		setHasSeenWhatsNewModal,
	};
};
