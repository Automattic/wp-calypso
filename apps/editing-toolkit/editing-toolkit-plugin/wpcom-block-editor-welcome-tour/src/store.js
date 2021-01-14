/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { combineReducers, registerStore } from '@wordpress/data';

const isNuxEnabledReducer = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'WPCOM_BLOCK_EDITOR_NUX_SET_STATUS':
			return action.isNuxEnabled;
		default:
			return state;
	}
};
const isTourManuallyOpenedReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case 'WPCOM_BLOCK_EDITOR_SET_TOUR_OPEN':
			return action.isTourManuallyOpened;
		default:
			return state;
	}
};

// TODO: next PR convert file to Typescript to ensure control of tourRating values: null, 'thumbs-up' 'thumbs-down'
const tourRatingReducer = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'WPCOM_BLOCK_EDITOR_SET_TOUR_RATING':
			return action.tourRating;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	isNuxEnabled: isNuxEnabledReducer,
	isTourManuallyOpened: isTourManuallyOpenedReducer,
	tourRating: tourRatingReducer,
} );

const actions = {
	// TODO: Clarify variable naming of nux vs tour for consistency and to better reflect terminology in core
	// isFeatureActive instead of isNuxEnabled would match core nad make this logic easier to understand.
	setWpcomNuxStatus: ( { isNuxEnabled, bypassApi } ) => {
		if ( ! bypassApi ) {
			apiFetch( {
				path: '/wpcom/v2/block-editor/nux',
				method: 'POST',
				data: { isNuxEnabled },
			} );
		}
		return {
			type: 'WPCOM_BLOCK_EDITOR_NUX_SET_STATUS',
			isNuxEnabled,
		};
	},
	setTourRating: ( tourRating ) => {
		return { type: 'WPCOM_BLOCK_EDITOR_SET_TOUR_RATING', tourRating };
	},
	setTourOpenStatus: ( { isTourManuallyOpened } ) => {
		return {
			type: 'WPCOM_BLOCK_EDITOR_SET_TOUR_OPEN',
			isTourManuallyOpened,
		};
	},
};

const selectors = {
	isTourManuallyOpened: ( state ) => state.isTourManuallyOpened,
	isWpcomNuxEnabled: ( state ) => state.isNuxEnabled,
	tourRating: ( state ) => state.tourRating,
};

registerStore( 'automattic/nux', {
	reducer,
	actions,
	selectors,
	persist: true,
} );
