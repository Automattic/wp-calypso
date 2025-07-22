import { translate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { Feed } from 'calypso/state/data-layer/wpcom/read/feed/types';
import {
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from 'calypso/state/reader/lists/actions';
import { useRecommendedList } from './use-recommend-list';

type FeedId = Feed[ 'feed_ID' ];

//TODO: Refactor to use react-query
export const useRecommendedListMutation = ( owner: string ) => {
	const dispatch = useDispatch();
	const list = useRecommendedList( owner );
	const listId = list?.ID;

	const add = ( feedId: FeedId ) => {
		if ( ! listId ) {
			return;
		}
		dispatch(
			addRecommendedBlogsSite( listId, feedId, owner, {
				successMessage: translate( 'Site added to your recommended blogs.' ),
				errorMessage: translate( 'Failed to add site to recommended blogs. Please try again.' ),
			} )
		);
	};

	const remove = ( feedId: FeedId ) => {
		if ( ! listId ) {
			return;
		}
		dispatch(
			removeRecommendedBlogsSite( listId, feedId, owner, {
				successMessage: translate( 'Site removed from your recommended blogs.' ),
				errorMessage: translate(
					'Failed to remove site from recommended blogs. Please try again.'
				),
			} )
		);
	};

	return { add, remove };
};
