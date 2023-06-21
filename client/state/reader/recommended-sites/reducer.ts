import { uniqBy } from 'lodash';
import {
	READER_RECOMMENDED_SITE_DISMISSED,
	READER_RECOMMENDED_SITE_FOLLOWED,
	READER_RECOMMENDED_SITES_RECEIVE,
} from 'calypso/state/reader/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import {
	dismissedRecommendedSite,
	followedRecommendedSite,
	receiveRecommendedSites,
} from './actions';
import { RecommendedSite } from './types';

/**
 * Tracks mappings between randomization seeds and site recs.
 * Sites get stored in a flat list. Just the basics like title/feedId,blogId.
 */
export const items = keyedReducer< RecommendedSite[] >( 'seed', ( state = [], action ) => {
	switch ( action.type ) {
		case READER_RECOMMENDED_SITES_RECEIVE:
			return uniqBy(
				state.concat( ( action as ReturnType< typeof receiveRecommendedSites > ).payload.sites ),
				'feedId'
			);
		case READER_RECOMMENDED_SITE_FOLLOWED:
		case READER_RECOMMENDED_SITE_DISMISSED:
			return state.filter(
				( { blogId } ) =>
					blogId !==
					(
						action as
							| ReturnType< typeof dismissedRecommendedSite >
							| ReturnType< typeof followedRecommendedSite >
					 ).payload.siteId
			);
	}

	return state;
} );

/**
 * Tracks mappings between randomization seeds and current offset in the that seed's stream.
 * this is for used when requesting the next page of site recs
 */
export const pagingOffset = keyedReducer< number >( 'seed', ( state = 0, action ) => {
	switch ( action.type ) {
		case READER_RECOMMENDED_SITES_RECEIVE:
			return Math.max(
				( action as ReturnType< typeof receiveRecommendedSites > ).payload.offset,
				state
			);
	}

	return state;
} );

export default combineReducers( {
	items,
	pagingOffset,
} );
