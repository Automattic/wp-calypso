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

function isIncomingMediaFieldEmpty( value ) {
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

function existingMediaFieldHasValue( value ) {
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
				const existing = state[ post.global_ID ];
				const { feed_item_IDs = [] } = existing ?? {};
				const { feed_item_ID, global_ID } = post;

				let merged = { ...post };
				if ( existing ) {
					merged = { ...existing, ...post };
					for ( const field of MEDIA_FIELDS_TO_PRESERVE ) {
						if (
							isIncomingMediaFieldEmpty( post[ field ] ) &&
							existingMediaFieldHasValue( existing[ field ] )
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
