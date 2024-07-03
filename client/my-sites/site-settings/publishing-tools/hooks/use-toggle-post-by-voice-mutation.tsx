import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	getPostByVoiceQueryKey,
	getPostByVoicePath,
} from 'calypso/my-sites/site-settings/publishing-tools/hooks/use-get-post-by-voice';
import { convertSnakeCaseToCamelCase } from 'calypso/state/data-layer/convert-snake-case-to-camel-case';
import type {
	PostByVoice,
	PostByVoiceResponse,
} from 'calypso/my-sites/site-settings/publishing-tools/types';

export const useTogglePostByVoiceMutation = ( siteId: number | null ) => {
	const queryClient = useQueryClient();
	const queryKey = getPostByVoiceQueryKey( siteId );

	return useMutation( {
		mutationFn: async ( shouldEnable: boolean ) => {
			const response: PostByVoiceResponse = await wpcom.req.post( {
				method: shouldEnable ? 'POST' : 'DELETE',
				path: getPostByVoicePath( siteId ),
				apiNamespace: 'wpcom/v2',
			} );

			return convertSnakeCaseToCamelCase( response );
		},
		onMutate: async ( value: boolean ) => {
			await queryClient.cancelQueries( {
				queryKey,
			} );

			const restoreData = queryClient.getQueryData< PostByVoice >( queryKey );

			queryClient.setQueryData< PostByVoice >( queryKey, () => {
				return {
					isEnabled: value,
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
