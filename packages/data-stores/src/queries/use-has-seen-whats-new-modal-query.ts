import { shouldTargetWpcom } from '@automattic/help-center';
import apiFetch from '@wordpress/api-fetch';
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

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export const useHasSeenWhatsNewModalQuery = ( siteId: number | null, isSimpleSite: boolean ) => {
	const queryKey = 'has-seen-whats-new-modal';

	const { data, isLoading } = useQuery< { has_seen_whats_new_modal: boolean } >(
		queryKey,
		() =>
			shouldTargetWpcom( isSimpleSite )
				? wpcomRequest( {
						path: `/block-editor/has-seen-whats-new-modal`,
						apiNamespace: 'wpcom/v2',
				  } )
				: apiFetch( {
						global: true,
						path: `/wpcom/v2/block-editor/has-seen-whats-new-modal`,
				  } as APIFetchOptions ),
		{
			enabled: !! siteId,
			refetchOnWindowFocus: false,
		}
	);

	const queryClient = useQueryClient();
	const mutation = useMutation< HasSeenWhatsNewModalResult, UpdateError, HasSeenWhatsNewModal >(
		( { hasSeenWhatsNewModal } ) =>
			shouldTargetWpcom( isSimpleSite )
				? wpcomRequest( {
						path: `/block-editor/has-seen-whats-new-modal`,
						apiNamespace: 'wpcom/v2',
						method: 'PUT',
						body: {
							has_seen_whats_new_modal: hasSeenWhatsNewModal,
						},
				  } )
				: apiFetch( {
						path: `/wpcom/v2/block-editor/has-seen-whats-new-modal`,
						method: 'PUT',
						data: { has_seen_whats_new_modal: hasSeenWhatsNewModal },
				  } ),
		{
			onSuccess( data ) {
				queryClient.setQueryData( queryKey, {
					...data,
				} );
			},
		}
	);

	const { mutateAsync } = mutation;

	const setHasSeenWhatsNewModal = useCallback(
		( hasSeenWhatsNewModal: boolean ) => {
			return mutateAsync( { hasSeenWhatsNewModal } );
		},
		[ mutateAsync ]
	);

	return {
		data,
		isLoading,
		setHasSeenWhatsNewModal,
	};
};
