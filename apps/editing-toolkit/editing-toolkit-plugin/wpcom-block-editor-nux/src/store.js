import apiFetch from '@wordpress/api-fetch';
import { combineReducers, registerStore } from '@wordpress/data';
import { apiFetch as apiFetchControls, controls } from '@wordpress/data-controls';

import 'a8c-fse-common-data-stores';

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

const shouldShowFirstPostPublishedModalReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case 'WPCOM_SET_SHOULD_SHOW_FIRST_POST_PUBLISHED_MODAL':
			return action.value;
		case 'WPCOM_WELCOME_GUIDE_RESET_STORE':
			return false;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	welcomeGuideManuallyOpened: welcomeGuideManuallyOpenedReducer,
	showWelcomeGuide: showWelcomeGuideReducer,
	tourRating: tourRatingReducer,
	welcomeGuideVariant: welcomeGuideVariantReducer,
	shouldShowFirstPostPublishedModal: shouldShowFirstPostPublishedModalReducer,
} );

const actions = {
	*fetchWelcomeGuideStatus() {
		const response = yield apiFetchControls( { path: '/wpcom/v2/block-editor/nux' } );

		return {
			type: 'WPCOM_WELCOME_GUIDE_FETCH_STATUS_SUCCESS',
			response,
		};
	},
	*fetchShouldShowFirstPostPublishedModal() {
		const response = yield apiFetchControls( {
			path: '/wpcom/v2/block-editor/should-show-first-post-published-modal',
		} );

		return {
			type: 'WPCOM_SET_SHOULD_SHOW_FIRST_POST_PUBLISHED_MODAL',
			value: response.should_show_first_post_published_modal,
		};
	},
	setShowWelcomeGuide: ( show, { openedManually, onlyLocal } = {} ) => {
		if ( ! onlyLocal ) {
			apiFetch( {
				path: '/wpcom/v2/block-editor/nux',
				method: 'POST',
				data: { show_welcome_guide: show },
			} );
		}

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

export const selectors = {
	isWelcomeGuideManuallyOpened: ( state ) => state.welcomeGuideManuallyOpened,
	isWelcomeGuideShown: ( state ) => !! state.showWelcomeGuide,
	isWelcomeGuideStatusLoaded: ( state ) => typeof state.showWelcomeGuide !== 'undefined',
	getTourRating: ( state ) => state.tourRating,
	// the 'modal' variant previously used for mobile has been removed but its slug may still be persisted in local storage
	getWelcomeGuideVariant: ( state ) =>
		state.welcomeGuideVariant === 'modal' ? DEFAULT_VARIANT : state.welcomeGuideVariant,
	getShouldShowFirstPostPublishedModal: ( state ) => state.shouldShowFirstPostPublishedModal,
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
