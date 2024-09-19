import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	getPostByVoiceQueryKey,
	getPostByVoicePath,
} from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-get-post-by-voice';
import type {
	PostByVoice,
	PostByVoiceResponse,
} from 'calypso/my-sites/site-settings/publishing-tools/types';

export const useRegeneratePostByVoiceMutation = ( siteId: number | null ) => {
	const queryClient = useQueryClient();
	const queryKey = getPostByVoiceQueryKey( siteId );

	return useMutation( {
		mutationFn: async () => {
			const response: PostByVoiceResponse = await wpcom.req.put( {
				method: 'PUT',
				path: getPostByVoicePath( siteId ),
				apiNamespace: 'wpcom/v2',
			} );

			const previousData = queryClient.getQueryData< PostByVoice >( queryKey );

			if ( ! previousData ) {
				return;
			}

			return {
				...previousData,
				code: response.code,
			};
		},
		onSuccess: ( response ) => {
			queryClient.setQueryData< PostByVoice >( queryKey, response );
		},
	} );
};
