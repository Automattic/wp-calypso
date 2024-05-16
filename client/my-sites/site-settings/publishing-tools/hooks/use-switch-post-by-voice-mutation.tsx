import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getCachePostByVoiceKey } from 'calypso/my-sites/site-settings/publishing-tools/hooks/get-cache-post-by-voice-key';
import { getPostByVoicePath } from 'calypso/my-sites/site-settings/publishing-tools/hooks/get-post-by-voice-path';
import { parsePostByVoiceResponse } from 'calypso/my-sites/site-settings/publishing-tools/hooks/parse-post-by-voice-response';
import type { PostByVoice } from 'calypso/my-sites/site-settings/publishing-tools/types/post-by-voice';
import type { PostByVoiceResponse } from 'calypso/my-sites/site-settings/publishing-tools/types/post-by-voice-response';

export const useSwitchPostByVoiceMutation = ( siteId: number | null ) => {
	const queryClient = useQueryClient();
	const queryKey = getCachePostByVoiceKey( siteId );

	return useMutation( {
		mutationFn: async ( value: boolean ) => {
			let response: PostByVoiceResponse;
			if ( value ) {
				response = await await wpcom.req.post( {
					method: 'POST',
					path: getPostByVoicePath( siteId ),
					apiNamespace: 'wpcom/v2',
				} );
			} else {
				response = await await wpcom.req.del( {
					method: 'DELETE',
					path: getPostByVoicePath( siteId ),
					apiNamespace: 'wpcom/v2',
				} );
			}

			return parsePostByVoiceResponse( response );
		},
		onMutate: async ( value: boolean ) => {
			await queryClient.cancelQueries( {
				queryKey,
			} );

			const restoreData = queryClient.getQueryData< PostByVoice >( queryKey );

			queryClient.setQueryData< PostByVoice >( queryKey, () => {
				if ( value ) {
					return {
						isEnabled: true,
					};
				}

				return {
					isEnabled: false,
					code: undefined,
				};
			} );

			return { restoreData };
		},
		onSuccess: ( response ) => {
			queryClient.setQueryData< PostByVoice >( queryKey, response );
		},
		onError: ( err, value, context ) => {
			const restoreData = context?.restoreData;

			queryClient.setQueryData< PostByVoice >( queryKey, restoreData );
		},
	} );
};
