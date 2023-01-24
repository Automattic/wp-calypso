import { flatMap } from 'lodash';
import moment from 'moment';
import { isDiscoverBlog, isDiscoverFeed } from 'calypso/reader/discover/helper';

export function isDiscoverPostKey( postKey ) {
	return isDiscoverBlog( postKey.blogId ) || isDiscoverFeed( postKey.feedId );
}

export const RECS_PER_BLOCK = 2;

/**
 * Check if two postKeys are for the same siteId or feedId
 *
 * @param {Object} postKey1 First post key
 * @param {Object} postKey2 Second post key
 * @returns {boolean} Returns true if two postKeys are for the same siteId or feedId
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

export function sameXPost( postKey1, postKey2 ) {
	return (
		postKey1 &&
		postKey2 &&
		postKey1.xPostMetadata &&
		postKey2.xPostMetadata &&
		postKey1.xPostMetadata.blogId &&
		postKey1.xPostMetadata.blogId === postKey2.xPostMetadata.blogId &&
		postKey1.xPostMetadata.postId &&
		postKey1.xPostMetadata.postId === postKey2.xPostMetadata.postId
	);
}

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

	return Math.min(
		Math.max( Math.floor( Math.log( totalSubs ) * Math.LOG2E * 5 - 6 ), MIN_DISTANCE_BETWEEN_RECS ),
		MAX_DISTANCE_BETWEEN_RECS
	);
}
