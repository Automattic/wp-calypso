/* eslint-disable no-case-declarations */

import { get, forEach } from 'lodash';
import {
	READER_POSTS_RECEIVE,
	READER_POST_SEEN,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
} from 'calypso/state/reader/action-types';
import { combineReducers } from 'calypso/state/utils';

const MEDIA_FIELDS_TO_PRESERVE = [
	'featured_image',
	'canonical_media',
	'canonical_image',
	'post_thumbnail',
];

/**
 * Stream-normalized posts may carry canonical_media objects with keys but no usable src;
 * treat those as empty so we do not clobber a good full-post canonical_media.
 */
function isEmptyCanonicalMedia( value ) {
	if ( value == null || value === '' ) {
		return true;
	}
	if (
		typeof value !== 'object' ||
		value === null ||
		Array.isArray( value ) ||
		Object.keys( value ).length === 0
	) {
		return true;
	}
	const { mediaType, src, autoplayIframe } = value;
	if ( mediaType === 'video' ) {
		if ( autoplayIframe ) {
			return false;
		}
		const srcStr = typeof src === 'string' ? src.trim() : '';
		return srcStr === '';
	}
	const srcStr = typeof src === 'string' ? src.trim() : '';
	return srcStr === '';
}

function isEmptyCanonicalImage( value ) {
	if ( value == null || value === '' ) {
		return true;
	}
	if (
		typeof value !== 'object' ||
		value === null ||
		Array.isArray( value ) ||
		Object.keys( value ).length === 0
	) {
		return true;
	}
	const uri = typeof value.uri === 'string' ? value.uri.trim() : '';
	return uri === '';
}

function isIncomingMediaFieldEmpty( fieldName, value ) {
	if ( fieldName === 'canonical_media' ) {
		return isEmptyCanonicalMedia( value );
	}
	if ( fieldName === 'canonical_image' ) {
		return isEmptyCanonicalImage( value );
	}
	if ( value == null || value === '' ) {
		return true;
	}
	if (
		typeof value === 'object' &&
		value !== null &&
		! Array.isArray( value ) &&
		Object.keys( value ).length === 0
	) {
		return true;
	}
	return false;
}

function existingMediaFieldHasValue( fieldName, value ) {
	if ( fieldName === 'canonical_media' ) {
		return ! isEmptyCanonicalMedia( value );
	}
	if ( fieldName === 'canonical_image' ) {
		return ! isEmptyCanonicalImage( value );
	}
	if ( value == null || value === '' ) {
		return false;
	}
	if (
		typeof value === 'object' &&
		value !== null &&
		! Array.isArray( value ) &&
		Object.keys( value ).length === 0
	) {
		return false;
	}
	return true;
}

/**
 * True when two posts are the same Reader item but may have different global_ID
 * (e.g. single-post vs feed list responses). getPostByKey maps by feed/site keys, so
 * duplicates must share merged media or the wrong copy wins in the selector.
 */
function postsMatchSameReaderItem( a, b ) {
	if ( ! a || ! b || a.global_ID === b.global_ID ) {
		return false;
	}
	const sameBlog =
		a.site_ID && b.site_ID && a.ID && b.ID && a.site_ID === b.site_ID && a.ID === b.ID;
	if ( sameBlog ) {
		return true;
	}
	if ( ! a.feed_ID || ! b.feed_ID || a.feed_ID !== b.feed_ID ) {
		return false;
	}
	const aItem = a.feed_item_ID;
	const bItem = b.feed_item_ID;
	if ( aItem && bItem && aItem === bItem ) {
		return true;
	}
	const bIds = b.feed_item_IDs || [];
	const aIds = a.feed_item_IDs || [];
	if ( aItem && bIds.length && bIds.includes( aItem ) ) {
		return true;
	}
	if ( bItem && aIds.length && aIds.includes( bItem ) ) {
		return true;
	}
	return false;
}

function findSiblingPost( state, post ) {
	if ( ! post?.global_ID ) {
		return undefined;
	}
	for ( const candidate of Object.values( state ) ) {
		if ( postsMatchSameReaderItem( post, candidate ) ) {
			return candidate;
		}
	}
	return undefined;
}

/**
 * Combine two store entries for the same logical post so spread(incoming) does not drop
 * media that only exists on the sibling (different global_ID).
 */
function mergeDirectAndSiblingForMedia( direct, sibling ) {
	const merged = { ...sibling, ...direct };
	for ( const field of MEDIA_FIELDS_TO_PRESERVE ) {
		if (
			isIncomingMediaFieldEmpty( field, direct[ field ] ) &&
			existingMediaFieldHasValue( field, sibling[ field ] )
		) {
			merged[ field ] = sibling[ field ];
		}
	}
	return merged;
}

function resolveExistingPostForMerge( state, post ) {
	const direct = state[ post.global_ID ];
	const sibling = findSiblingPost( state, post );
	if ( direct && sibling ) {
		return mergeDirectAndSiblingForMedia( direct, sibling );
	}
	return direct || sibling;
}

/**
 * Tracks all known post objects, indexed by post ID.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_POSTS_RECEIVE:
			const posts = action.posts || action.payload.posts;
			const postsByKey = {};

			// Keep track of all the feed_item_ID that have the same global_ID.
			// See: https://github.com/Automattic/wp-calypso/pull/88408
			posts.forEach( ( post ) => {
				const existing = resolveExistingPostForMerge( state, post );
				const { feed_item_IDs = [] } = existing ?? {};
				const { feed_item_ID, global_ID } = post;

				let merged = { ...post };
				if ( existing ) {
					merged = { ...existing, ...post };
					for ( const field of MEDIA_FIELDS_TO_PRESERVE ) {
						if (
							isIncomingMediaFieldEmpty( field, post[ field ] ) &&
							existingMediaFieldHasValue( field, existing[ field ] )
						) {
							merged[ field ] = existing[ field ];
						}
					}
				}

				postsByKey[ global_ID ] = {
					...merged,
					...( feed_item_ID && {
						feed_item_IDs: feed_item_IDs.length
							? [ ...new Set( [ ...feed_item_IDs, feed_item_ID ] ) ]
							: [ feed_item_ID ],
					} ),
				};
			} );

			return { ...state, ...postsByKey };

		case READER_SEEN_MARK_AS_SEEN_RECEIVE:
		case READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE:
			forEach( action.globalIds, ( globalId ) => {
				state[ globalId ] = { ...state[ globalId ], is_seen: true };
			} );
			return { ...state };

		case READER_SEEN_MARK_AS_UNSEEN_RECEIVE:
			forEach( action.globalIds, ( globalId ) => {
				state[ globalId ] = { ...state[ globalId ], is_seen: false };
			} );
			return { ...state };
	}
	return state;
}
export function seen( state = {}, action ) {
	const id = get( action, 'payload.post.global_ID' );

	if ( action.type === READER_POST_SEEN && id ) {
		return { ...state, [ id ]: true };
	}

	return state;
}
// @TODO: evaluate serialization later
// import { itemsSchema } from './schema';
// export const items = withSchemaValidation( itemsSchema, itemsReducer );

export default combineReducers( {
	items,
	seen,
} );
