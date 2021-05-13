/**
 * External dependencies
 */
import 'a8c-fse-common-data-stores';
import apiFetch from '@wordpress/api-fetch';
import { apiFetch as apiFetchControls, controls } from '@wordpress/data-controls';
import { combineReducers, registerStore } from '@wordpress/data';

export const DEFAULT_VARIANT = 'tour';
export const BLANK_CANVAS_VARIANT = 'blank-canvas-tour';

const showWelcomeGuideReducer = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'WPCOM_WELCOME_GUIDE_FETCH_STATUS_SUCCESS':
			return action.response.show_welcome_guide;
		case 'WPCOM_WELCOME_GUIDE_SHOW_SET':
			return action.show;
		case 'WPCOM_WELCOME_GUIDE_RESET_STORE':
			return undefined;
		default:
			return state;
	}
};

const welcomeGuideManuallyOpenedReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case 'WPCOM_WELCOME_GUIDE_SHOW_SET':
			if ( typeof action.openedManually !== 'undefined' ) {
				return action.openedManually;
			}
			return state;

		case 'WPCOM_WELCOME_GUIDE_RESET_STORE':
			return false;

		default:
			return state;
	}
};

// TODO: next PR convert file to Typescript to ensure control of tourRating values: null, 'thumbs-up' 'thumbs-down'
const tourRatingReducer = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'WPCOM_WELCOME_GUIDE_TOUR_RATING_SET':
			return action.tourRating;
		case 'WPCOM_WELCOME_GUIDE_RESET_STORE':
			return undefined;
		default:
			return state;
	}
};

const welcomeGuideVariantReducer = ( state = DEFAULT_VARIANT, action ) => {
	switch ( action.type ) {
		case 'WPCOM_WELCOME_GUIDE_FETCH_STATUS_SUCCESS':
			return action.response.variant;
		case 'WPCOM_HAS_USED_PATTERNS_MODAL':
			return state === BLANK_CANVAS_VARIANT ? DEFAULT_VARIANT : state;
		case 'WPCOM_WELCOME_GUIDE_RESET_STORE':
			return DEFAULT_VARIANT;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	welcomeGuideManuallyOpened: welcomeGuideManuallyOpenedReducer,
	showWelcomeGuide: showWelcomeGuideReducer,
	tourRating: tourRatingReducer,
	welcomeGuideVariant: welcomeGuideVariantReducer,
} );

const actions = {
	*fetchWelcomeGuideStatus() {
		const response = yield apiFetchControls( { path: '/wpcom/v2/block-editor/nux' } );

		return {
			type: 'WPCOM_WELCOME_GUIDE_FETCH_STATUS_SUCCESS',
			response,
		};
	},
	setShowWelcomeGuide: ( show, { openedManually } = {} ) => {
		apiFetch( {
			path: '/wpcom/v2/block-editor/nux',
			method: 'POST',
			data: { show_welcome_guide: show },
		} );

		return {
			type: 'WPCOM_WELCOME_GUIDE_SHOW_SET',
			show,
			openedManually,
		};
	},
	setTourRating: ( tourRating ) => {
		return { type: 'WPCOM_WELCOME_GUIDE_TOUR_RATING_SET', tourRating };
	},
	setUsedPageOrPatternsModal: () => {
		return { type: 'WPCOM_HAS_USED_PATTERNS_MODAL' };
	},
	// The `resetStore` action is only used for testing to reset the
	// store inbetween tests.
	resetStore: () => ( {
		type: 'WPCOM_WELCOME_GUIDE_RESET_STORE',
	} ),
};

const selectors = {
	isWelcomeGuideManuallyOpened: ( state ) => state.welcomeGuideManuallyOpened,
	isWelcomeGuideShown: ( state ) => !! state.showWelcomeGuide,
	isWelcomeGuideStatusLoaded: ( state ) => typeof state.showWelcomeGuide !== 'undefined',
	getTourRating: ( state ) => state.tourRating,
	getWelcomeGuideVariant: ( state ) => state.welcomeGuideVariant,
};

export function register() {
	return registerStore( 'automattic/wpcom-welcome-guide', {
		reducer,
		actions,
		selectors,
		controls,
		persist: true,
	} );
}
