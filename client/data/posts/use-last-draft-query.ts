import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

export interface LastDraft {
	id: number;
	siteId: number;
	title: string;
}

interface LastDraftResponse {
	posts?: Array< {
		ID?: number;
		site_ID?: number;
		title?: string;
	} >;
}

interface LastDraftQueryOptions {
	enabled?: boolean;
}

async function fetchLastDraft( currentUserId: number ): Promise< LastDraft | null > {
	const response = ( await wpcom.req.get( '/me/posts', {
		author: currentUserId,
		status: 'draft',
		type: 'post',
		order_by: 'modified',
		order: 'DESC',
		number: 1,
		fields: 'ID,site_ID,title',
	} ) ) as LastDraftResponse;
	const post = response.posts?.[ 0 ];

	if ( ! post?.ID || ! post.site_ID ) {
		return null;
	}

	return {
		id: post.ID,
		siteId: post.site_ID,
		title: decodeEntities( stripHTML( post.title ?? '' ) ).trim(),
	};
}

export default function useLastDraftQuery( {
	enabled = true,
}: LastDraftQueryOptions = {} ): UseQueryResult< LastDraft | null > {
	const currentUserId = useSelector( getCurrentUserId );

	return useQuery( {
		queryKey: [ 'posts', 'last-draft', currentUserId ],
		queryFn: () => ( currentUserId ? fetchLastDraft( currentUserId ) : null ),
		enabled: enabled && !! currentUserId,
		staleTime: Infinity,
		retry: false,
		refetchOnWindowFocus: false,
		meta: { persist: false },
	} );
}
