/** @format */
/**
 * External dependencies
 */
import { flatMap, last, clamp } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { isDiscoverBlog, isDiscoverFeed } from 'reader/discover/helper';

export function isDiscoverPostKey( postKey ) {
	return isDiscoverBlog( postKey.blogId ) || isDiscoverFeed( postKey.feedId );
}

export const RECS_PER_BLOCK = 2;

/**
 * Check if two postKeys are for the same siteId or feedId
 *
 * @param {Object} postKey1 First post key
 * @param {Object} postKey2 Second post key
 * @returns {Boolean} Returns true if two postKeys are for the same siteId or feedId
 */
export function sameSite( postKey1, postKey2 ) {
	return (
		postKey1 &&
		postKey2 &&
		! postKey1.isRecommendationBlock &&
		! postKey2.isRecommendationBlock &&
		( ( postKey1.blogId && postKey1.blogId === postKey2.blogId ) ||
			( postKey1.feedId && postKey1.feedId === postKey2.feedId ) )
	);
}

export function sameDay( postKey1, postKey2 ) {
	return moment( postKey1.date ).isSame( postKey2.date, 'day' );
}

/**
 * Takes two postKeys and combines them into a ReaderCombinedCard postKey.
 * Note: This only makes sense for postKeys from the same site
 *
 * @param {Object} postKey1 must be either a ReaderCombinedCard postKey or a regular postKey
 * @param {Object} postKey2 can only be a regular postKey. May not be a combinedCard postKey or a recommendations postKey
 * @returns {Object} A ReaderCombinedCard postKey
 */
export function combine( postKey1, postKey2 ) {
	if ( ! postKey1 || ! postKey2 ) {
		return null;
	}

	const combined = {
		isCombination: true,
		date:
			postKey1.date && postKey1.date < postKey2.date // keep the earliest moment
				? postKey1.date
				: postKey2.date,
		postIds: [
			...( postKey1.postIds || [ postKey1.postId ] ),
			...( postKey2.postIds || [ postKey2.postId ] ),
		],
	};
	postKey1.blogId && ( combined.blogId = postKey1.blogId );
	postKey1.feedId && ( combined.feedId = postKey1.feedId );

	return combined;
}

//@TODO: operate on things with dates...
export const combineCards = postKeys =>
	postKeys.reduce( ( accumulator, postKey ) => {
		const lastPostKey = last( accumulator );
		if (
			sameSite( lastPostKey, postKey ) &&
			sameDay( lastPostKey, postKey ) &&
			! isDiscoverPostKey( postKey )
		) {
			accumulator[ accumulator.length - 1 ] = combine( last( accumulator ), postKey );
		} else {
			accumulator.push( postKey );
		}
		return accumulator;
	}, [] );

export function injectRecommendations( posts, recs = [], itemsBetweenRecs ) {
	if ( ! recs || recs.length === 0 ) {
		return posts;
	}

	if ( posts.length < itemsBetweenRecs ) {
		return posts;
	}

	let recIndex = 0;

	return flatMap( posts, ( post, index ) => {
		if ( index && index % itemsBetweenRecs === 0 && recIndex < recs.length ) {
			const recBlock = {
				isRecommendationBlock: true,
				recommendations: recs.slice( recIndex, recIndex + RECS_PER_BLOCK ),
				index: recIndex,
			};
			recIndex += RECS_PER_BLOCK;
			return [ recBlock, post ];
		}
		return post;
	} );
}

const MIN_DISTANCE_BETWEEN_RECS = 4; // page size is 7, so one in the middle of every page and one on page boundries, sometimes
const MAX_DISTANCE_BETWEEN_RECS = 30;

export function getDistanceBetweenRecs( totalSubs ) {
	// the distance between recs changes based on how many subscriptions the user has.
	// We cap it at MAX_DISTANCE_BETWEEN_RECS.
	// It grows at the natural log of the number of subs, times a multiplier, offset by a constant.
	// This lets the distance between recs grow quickly as you add subs early on, and slow down as you
	// become a common user of the reader.
	if ( totalSubs <= 0 ) {
		// 0 means either we don't know yet, or the user actually has zero subs.
		// if a user has zero subs, we don't show posts at all, so just treat 0 as 'unknown' and
		// push recs to the max.
		return MAX_DISTANCE_BETWEEN_RECS;
	}
	const distance = clamp(
		Math.floor( Math.log( totalSubs ) * Math.LOG2E * 5 - 6 ),
		MIN_DISTANCE_BETWEEN_RECS,
		MAX_DISTANCE_BETWEEN_RECS
	);
	return distance;
}
