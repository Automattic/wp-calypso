/**
 * External dependencies
 */
import { flatMap, last } from 'lodash';

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
	return postKey1 && postKey2 &&
		! postKey1.isRecommendationBlock && ! postKey2.isRecommendationBlock && (
			( postKey1.blogId && postKey1.blogId === postKey2.blogId ) ||
			( postKey1.feedId && postKey1.feedId === postKey2.feedId )
		);
}

export function sameDay( postKey1, postKey2 ) {
	return postKey1.localMoment.isSame( postKey2.localMoment, 'day' );
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
		localMoment: postKey1.localMoment && postKey1.localMoment.isBefore( postKey2.localMoment ) // keep the earliest moment
			? postKey1.localMoment
			: postKey2.localMoment,
		postIds: [
			...( postKey1.postIds || [ postKey1.postId ] ),
			...( postKey2.postIds || [ postKey2.postId ] ),
		],
	};
	postKey1.blogId && ( combined.blogId = postKey1.blogId );
	postKey1.feedId && ( combined.feedId = postKey1.feedId );

	return combined;
}

export const combineCards = ( postKeys ) => postKeys.reduce(
	( accumulator, postKey ) => {
		const lastPostKey = last( accumulator );
		if ( sameSite( lastPostKey, postKey ) &&
			sameDay( lastPostKey, postKey ) &&
			! isDiscoverPostKey( postKey ) ) {
			accumulator[ accumulator.length - 1 ] = combine( last( accumulator ), postKey );
		} else {
			accumulator.push( postKey );
		}
		return accumulator;
	},
	[]
);

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
				index: recIndex
			};
			recIndex += RECS_PER_BLOCK;
			return [
				recBlock,
				post
			];
		}
		return post;
	} );
}
