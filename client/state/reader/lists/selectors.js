import { withoutHttp } from 'calypso/lib/url';
import 'calypso/state/reader/init';

export function getListItems( state, listId ) {
	return state.reader.lists.listItems[ listId ];
}

/**
 * @param {import('calypso/state/types').AppState} state
 * @param {{feedUrl?: string|null, feedId?: string|number|null, listId?: string|number, siteId?: string|number|null, tagId?: string|number|null}} args
 */
export function getMatchingItem( state, { feedUrl, feedId, listId, siteId, tagId } ) {
	// Find associated feed ID if feed URL is provided.
	if ( feedUrl ) {
		const feeds = state.reader.feeds.items;
		const matchingFeeds = Object.keys( feeds ).filter(
			( key ) =>
				feeds[ key ].feed_URL && withoutHttp( feeds[ key ].feed_URL ) === withoutHttp( feedUrl )
		);
		if ( matchingFeeds.length > 0 ) {
			feedId = feeds[ matchingFeeds[ 0 ] ].feed_ID;
		}
	}

	const list = state.reader.lists.listItems[ listId ]?.filter( ( item ) => {
		if ( feedId && item.feed_ID ) {
			return +item.feed_ID === +feedId;
		} else if ( siteId && item.site_ID ) {
			return +item.site_ID === +siteId;
		} else if ( tagId && item.tag_ID ) {
			return +item.tag_ID === +tagId;
		}
		return false;
	} );
	return list?.length > 0 ? list[ 0 ] : false;
}

/**
 * Check for the listOwners recommended blogs list
 * @param  {Object}  state  Global state tree
 * @param  {string}  listOwner User login of list owner
 * @returns {Array} Recommended blogs
 */
export function getUserRecommendedBlogs( state, listOwner ) {
	return state.reader.lists.userRecommendedBlogs[ listOwner ];
}

/**
 * Check if a recommended blogs request is in progress for a specific user.
 * @param  {Object}  state  Global state tree
 * @param  {string}  listOwner User login of list owner
 * @returns {boolean} Is the request in progress?
 */
export function isRequestingUserRecommendedBlogs( state, listOwner ) {
	return !! state.reader.lists.isRequestingUserRecommendedBlogs[ listOwner ];
}

/**
 * Check if a recommended blogs request has happened for a specific user.
 * @param  {Object}  state  Global state tree
 * @param  {string}  listOwner User login of list owner
 * @returns {boolean} Has a request been made?
 */
export function hasRequestedUserRecommendedBlogs( state, listOwner ) {
	const requestValue = state.reader.lists.isRequestingUserRecommendedBlogs[ listOwner ];
	return requestValue === true || requestValue === false;
}
