import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type {
	PostByEmail,
	PostByEmailResponse,
} from 'calypso/my-sites/site-settings/publishing-tools/types';

export const getPostByEmailPath = ( siteId: number | null ) => `/sites/${ siteId }/post-by-email`;

export const getPostByEmailKeyQueryKey = ( siteId: number | null ) => [
	'sites',
	siteId,
	'post-by-email',
];

export const parsePostByEmailResponse = ( data: PostByEmailResponse ): PostByEmail => ( {
	isEnabled: data.is_enabled,
	email: data.email,
} );

export const useGetPostByEmail = ( siteId: number | null ) => {
	return useQuery< PostByEmail >( {
		queryKey: getPostByEmailKeyQueryKey( siteId ),
		queryFn: async () => {
			const response: PostByEmailResponse = await wpcom.req.get( {
				path: getPostByEmailPath( siteId ),
				apiNamespace: 'wpcom/v2',
			} );

			return parsePostByEmailResponse( response );
		},
		enabled: !! siteId,
	} );
};
