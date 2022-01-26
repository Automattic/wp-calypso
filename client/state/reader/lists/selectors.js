import { createSelector } from '@automattic/state-utils';
import { filter, find } from 'lodash';
import { withoutHttp } from 'calypso/lib/url';
import getCurrentIntlCollator from 'calypso/state/selectors/get-current-intl-collator';
import 'calypso/state/reader/init';

/**
 * Returns true if currently requesting Reader lists, or
 * false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}        Whether lists are being requested
 */
export function isRequestingList( state ) {
	return !! state.reader.lists.isRequestingList;
}

/**
 * Returns true if currently creating a Reader list.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}        Whether lists are being requested
 */
export function isCreatingList( state ) {
	return !! state.reader.lists.isCreatingList;
}

/**
 * Returns true if currently updating a Reader list.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}        Whether lists are being requested
 */
export function isUpdatingList( state ) {
	return !! state.reader.lists.isUpdatingList;
}

/**
 * Returns the user's subscribed Reader lists.
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}         Reader lists
 */
export const getSubscribedLists = createSelector(
	( state ) => {
		const collator = getCurrentIntlCollator( state );

		return filter( Object.values( state.reader.lists.items ), ( item ) => {
			// Is the user subscribed to this list?
			return state.reader.lists.subscribedLists.includes( item.ID );
		} ).sort( ( a, b ) => {
			return collator.compare( a.title, b.title );
		} );
	},
	( state ) => [
		state.reader.lists.items,
		state.reader.lists.subscribedLists,
		state.ui?.language?.localeSlug,
	]
);

/**
 * Returns true if the specified list has been marked as updated.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  listId  List ID
 * @returns {boolean}        Whether lists are being requested
 */
export function isUpdatedList( state, listId ) {
	return state.reader.lists.updatedLists.includes( listId );
}

/**
 * Returns true if the specified list has an error recorded.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  listId  List ID
 * @returns {boolean}        Whether list has an error
 */
export function hasError( state, listId ) {
	return state.reader.lists.errors.hasOwnProperty( listId );
}

/**
 * Returns information about a single Reader list.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  owner  List owner
 * @param  {string}  slug  List slug
 * @returns {?object}        Reader list
 */
export function getListByOwnerAndSlug( state, owner, slug ) {
	if ( ! owner || ! slug ) {
		return;
	}

	const preparedOwner = owner.toLowerCase();
	const preparedSlug = slug.toLowerCase();

	return find( state.reader.lists.items, ( list ) => {
		return list.owner === preparedOwner && list.slug === preparedSlug;
	} );
}

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
 * Check if the user is subscribed to the specified list
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  owner  List owner
 * @param  {string}  slug  List slug
 * @returns {boolean} Is the user subscribed?
 */
export function isSubscribedByOwnerAndSlug( state, owner, slug ) {
	const list = getListByOwnerAndSlug( state, owner, slug );
	if ( ! list ) {
		return false;
	}
	return state.reader.lists.subscribedLists.includes( list.ID );
}

/**
 * Check if the requested list is missing (i.e. API 404ed when requesting it)
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  owner  List owner
 * @param  {string}  slug  List slug
 * @returns {boolean} Is the list missing?
 */
export function isMissingByOwnerAndSlug( state, owner, slug ) {
	return ! state.reader?.lists?.isRequestingLists && ! getListByOwnerAndSlug( state, owner, slug );
}
