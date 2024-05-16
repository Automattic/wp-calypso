import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getCachePostByVoiceKey } from 'calypso/my-sites/site-settings/publishing-tools/hooks/get-cache-post-by-voice-key';
import { getPostByVoicePath } from 'calypso/my-sites/site-settings/publishing-tools/hooks/get-post-by-voice-path';
import { parsePostByVoiceResponse } from 'calypso/my-sites/site-settings/publishing-tools/hooks/parse-post-by-voice-response';
import type { PostByVoice } from 'calypso/my-sites/site-settings/publishing-tools/types/post-by-voice';
import type { PostByVoiceResponse } from 'calypso/my-sites/site-settings/publishing-tools/types/post-by-voice-response';

export const useGetPostByVoice = ( siteId: number | null ) => {
	return useQuery< PostByVoice >( {
		queryKey: getCachePostByVoiceKey( siteId ),
		queryFn: async () => {
			const response: PostByVoiceResponse = await wpcom.req.get( {
				path: getPostByVoicePath( siteId ),
				apiNamespace: 'wpcom/v2',
			} );

			return parsePostByVoiceResponse( response );
		},
		enabled: !! siteId,
	} );
};
