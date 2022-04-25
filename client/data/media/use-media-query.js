import { useInfiniteQuery } from 'react-query';
import wp from 'calypso/lib/wp';

const defaults = {
	number: 20,
};

export const useMediaQuery = ( siteId, fetchOptions = {}, queryOptions = {} ) => {
	const { source } = fetchOptions;
	const path = source ? `/meta/external-media/${ source }` : `/sites/${ siteId }/media`;

	return useInfiniteQuery(
		[ 'media', siteId, fetchOptions ],
		( { pageParam } ) =>
			wp.req.get( path, { ...defaults, ...fetchOptions, page_handle: pageParam } ),
		{
			...queryOptions,
			getNextPageParam( lastPage ) {
				return lastPage.meta?.next_page;
			},
			select( data ) {
				return {
					media: data.pages.flatMap( ( page ) => page.media ),
					total: data.pages[ 0 ].found,
					...data,
				};
			},
			meta: {
				persist: false,
			},
		}
	);
};
