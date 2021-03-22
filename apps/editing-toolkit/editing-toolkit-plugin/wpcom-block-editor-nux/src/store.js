/**
 * External dependencies
 */
import 'a8c-fse-common-data-stores';
import apiFetch from '@wordpress/api-fetch';
import { apiFetch as apiFetchControls, controls } from '@wordpress/data-controls';
import { combineReducers, registerStore } from '@wordpress/data';

const showWelcomeGuideReducer = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'WPCOM_WELCOME_GUIDE_FETCH_STATUS_SUCCESS':
			if ( typeof action.response.show_welcome_guide !== 'undefined' ) {
				return action.response.show_welcome_guide;
			}

			// This legacy rest param can be removed after we know the new
			// PHP files have been deployed.
			return action.response.is_nux_enabled;

		case 'WPCOM_WELCOME_GUIDE_SHOW_SET':
			return action.show;
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

		default:
			return state;
	}
};

// TODO: next PR convert file to Typescript to ensure control of tourRating values: null, 'thumbs-up' 'thumbs-down'
const tourRatingReducer = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'WPCOM_WELCOME_GUIDE_TOUR_RATING_SET':
			return action.tourRating;
		default:
			return state;
	}
};

const welcomeGuideVariantReducer = ( state = 'tour', action ) => {
	switch ( action.type ) {
		case 'WPCOM_WELCOME_GUIDE_FETCH_STATUS_SUCCESS':
			if ( typeof action.response.variant !== 'undefined' ) {
				return action.response.variant;
			}

			// This legacy rest param can be removed after we know the new
			// PHP files have been deployed.
			return action.response.welcome_tour_show_variant ? 'tour' : 'modal';

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
			data: {
				show_welcome_guide: show,

				// This legacy rest param can be removed after we know the new
				// PHP files have been deployed.
				isNuxEnabled: show,
			},
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
};

const selectors = {
	isWelcomeGuideManuallyOpened: ( state ) => state.isTourManuallyOpened,
	isWelcomeGuideShown: ( state ) => !! state.showWelcomeGuide,
	isWelcomeGuideStatusLoaded: ( state ) => typeof state.showWelcomeGuide !== 'undefined',
	getTourRating: ( state ) => state.tourRating,
	getWelcomeGuideVariant: ( state ) => state.welcomeGuideVariant,
};

registerStore( 'automattic/wpcom-welcome-guide', {
	reducer,
	actions,
	selectors,
	controls,
	persist: true,
} );
