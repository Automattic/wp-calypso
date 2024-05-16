import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getCachePostByVoiceKey } from 'calypso/my-sites/site-settings/publishing-tools/hooks/get-cache-post-by-voice-key';
import { getPostByVoicePath } from 'calypso/my-sites/site-settings/publishing-tools/hooks/get-post-by-voice-path';
import type { PostByVoice } from 'calypso/my-sites/site-settings/publishing-tools/types/post-by-voice';
import type { PostByVoiceResponse } from 'calypso/my-sites/site-settings/publishing-tools/types/post-by-voice-response';

export const useRegeneratePostByVoiceMutation = ( siteId: number | null ) => {
	const queryClient = useQueryClient();
	const queryKey = getCachePostByVoiceKey( siteId );

	return useMutation( {
		mutationFn: async () => {
			const response: PostByVoiceResponse = await await wpcom.req.put( {
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
