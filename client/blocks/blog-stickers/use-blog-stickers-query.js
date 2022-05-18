import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

export const useBlogStickersQuery = ( blogId, queryOptions = {} ) =>
	useQuery( [ 'blog-stickers', blogId ], () => wp.req.get( `/sites/${ blogId }/blog-stickers` ), {
		...queryOptions,
		enabled: !! blogId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
