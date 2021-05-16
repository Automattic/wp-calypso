import { useInfiniteQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const defaults = {
	number: 20,
};

const useMediaQuery = ( siteId, fetchOptions = {}, queryOptions = {} ) => {
	const { source } = fetchOptions;
	const path = source ? `/meta/external-media/${ source }` : `/sites/${ siteId }/media`;

	return useInfiniteQuery(
		[ 'media', siteId, fetchOptions ],
		( { pageParam } ) =>
			wpcom.req.get( path, { ...defaults, ...fetchOptions, page_handle: pageParam } ),
		{
			...queryOptions,
			getNextPageParam: ( lastPage ) => lastPage.meta?.next_page,
			select: ( data ) => ( {
				media: data.pages.flatMap( ( page ) => page.media ),
				total: data.pages[ 0 ].found,
				...data,
			} ),
		}
	);
};

export default useMediaQuery;
