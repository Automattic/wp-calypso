import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'calypso/data/media/use-media-query';
import { getTransientMediaItems } from 'calypso/state/selectors/get-transient-media-items';
import { getMimeBaseTypeFromFilter } from './utils';

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
			query.mime_type = getMimeBaseTypeFromFilter( filter );
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

		// @TODO move this to `useMediaQuery.select`
		const transientMediaItems = useSelector( ( state ) =>
			getTransientMediaItems( state, site.ID )
		);

		const media = data?.media ?? [];

		return (
			<Wrapped
				{ ...props }
				media={ transientMediaItems.length ? transientMediaItems.concat( media ) : media }
				hasNextPage={ hasNextPage }
				fetchNextPage={ fetchNextPage }
				isLoading={ isLoading }
				isFetchingNextPage={ isFetchingNextPage }
			/>
		);
	},
	'WithMedia'
);
