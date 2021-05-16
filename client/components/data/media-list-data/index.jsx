import { createHigherOrderComponent } from '@wordpress/compose';
import useMediaQuery from 'calypso/data/media/use-media-query';
import utils from './utils';

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
	( Component ) => ( props ) => {
		const { site, postId, filter, search, source } = props;
		const fetchOptions = getQuery( { search, source, filter, postId } );
		const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMediaQuery(
			site.ID,
			fetchOptions
		);

		return (
			<Component
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
