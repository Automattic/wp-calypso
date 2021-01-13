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
	tourRating: tourRatingReducer,
} );

const actions = {
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
	toggleWpcomTourManualOpenStatus: ( isTourManuallyOpen ) => {
		return {
			type: 'WPCOM_BLOCK_EDITOR_TOGGLE_TOUR_MANUALLY_OPEN',
			isManuallyOpen,
		};
	},
};

const selectors = {
	isWpcomTourManuallyOpen: ( state ) => state.isTourManuallyOpen,
	isWpcomNuxEnabled: ( state ) => state.isNuxEnabled,
	tourRating: ( state ) => state.tourRating,
};

registerStore( 'automattic/nux', {
	reducer,
	actions,
	selectors,
	persist: true,
} );
