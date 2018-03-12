/** @format */
/**
 * External dependencies
 */
import { keyBy, merge, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_TAGS, READER_UNFOLLOW_TAG_RECEIVE } from 'state/action-types';
import { createReducer } from 'state/utils';

/*
 * since the api always returns the whole list of followed tags unpaginated, both read/tags*,
 * we can do a full replace instead of merge
 *
 * the shape of a tag is { id, url, title, displayName, isFollowing }.
 */
export const items = createReducer( null, {
	[ READER_TAGS ]: ( state, action ) => {
		const tags = action.payload;
		const resetFollowingData = action.meta.resetFollowingData;

		if ( ! resetFollowingData ) {
			return merge( {}, state, keyBy( tags, 'id' ) );
		}

		const allTagsUnfollowed = mapValues( state, tag => ( { ...tag, isFollowing: false } ) );

		return merge( {}, allTagsUnfollowed, keyBy( tags, 'id' ) );
	},
	[ READER_UNFOLLOW_TAG_RECEIVE ]: ( state, action ) => {
		const removedTag = action.payload;
		return merge( {}, state, { [ removedTag ]: { isFollowing: false } } );
	},
} );

// TODO:  add in error handling
// if ( get( getHeaders( action ), 'status' ) === 404 ) {
// 		const slug = action.payload.slug;
// 		return receiveTags( {
// 			payload: [ { id: slug, slug, error: true } ],
// 		} );
// 	}

// 	const errorText =
// 		action.payload && action.payload.slug
// 			? translate( 'Could not load tag, try refreshing the page' )
// 			: translate( 'Could not load your followed tags, try refreshing the page' );

// 	// see: https://github.com/Automattic/wp-calypso/pull/11627/files#r104468481
// 	if ( process.env.NODE_ENV === 'development' ) {
// 		console.error( errorText, error ); // eslint-disable-line no-console
// 	}

export default items;
