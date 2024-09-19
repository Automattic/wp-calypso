import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { convertSnakeCaseToCamelCase } from 'calypso/state/data-layer/convert-snake-case-to-camel-case';
import type {
	PostByVoice,
	PostByVoiceResponse,
} from 'calypso/my-sites/site-settings/publishing-tools/types';

export const getPostByVoicePath = ( siteId: number | null ) => `/sites/${ siteId }/post-by-voice`;

export const getPostByVoiceQueryKey = ( siteId: number | null ) => [
	'sites',
	siteId,
	'post-by-voice',
];

export const useGetPostByVoice = ( siteId: number | null ) => {
	return useQuery< PostByVoice >( {
		queryKey: getPostByVoiceQueryKey( siteId ),
		queryFn: async () => {
			const response: PostByVoiceResponse = await wpcom.req.get( {
				path: getPostByVoicePath( siteId ),
				apiNamespace: 'wpcom/v2',
			} );

			return convertSnakeCaseToCamelCase( response );
		},
		enabled: !! siteId,
	} );
};
