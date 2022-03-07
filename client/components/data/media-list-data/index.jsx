import { createHigherOrderComponent } from '@wordpress/compose';
import { useInfiniteQuery } from 'react-query';
import wp from 'calypso/lib/wp';
import utils from './utils';

const defaults = {
	number: 20,
};

const useMediaQuery = ( siteId, fetchOptions = {}, queryOptions = {} ) => {
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
		}
	);
};

const getQuery = ( { search, source, filter, postId } ) => {
	const query = {};

	if ( search ) {
		query.search = search;
	}

	if ( filter && ! source ) {
		if ( filter === 'this-post' ) {
			if ( postId ) {
				query.post_ID = postId;
			}
		} else {
			query.mime_type = utils.getMimeBaseTypeFromFilter( filter );
		}
	}

	if ( source ) {
		query.source = source;
		query.path = 'recent';

		// @TODO
		// if ( source === 'google_photos' ) {
		// 	// Add any query params specific to Google Photos
		// 	return utils.getGoogleQuery( query, props );
		// }
	}

	return query;
};

export const withMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { site, postId, filter, search, source } = props;
		const fetchOptions = getQuery( { search, source, filter, postId } );
		const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMediaQuery(
			site.ID,
			fetchOptions
		);

		return (
			<Wrapped
				{ ...props }
				media={ data?.media ?? [] }
				hasNextPage={ hasNextPage }
				fetchNextPage={ fetchNextPage }
				isLoading={ isLoading }
				isFetchingNextPage={ isFetchingNextPage }
			/>
		);
	},
	'WithMedia'
);
