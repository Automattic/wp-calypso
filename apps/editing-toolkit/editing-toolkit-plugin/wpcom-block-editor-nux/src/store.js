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
const isGuideManuallyOpenedReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case 'WPCOM_BLOCK_EDITOR_SET_GUIDE_OPEN':
			return action.isGuideManuallyOpened;
		default:
			return state;
	}
};

// TODO: next PR convert file to Typescript to ensure control of guideRating values: null, 'thumbs-up' 'thumbs-down'
const guideRatingReducer = ( state = undefined, action ) => {
	switch ( action.type ) {
		case 'WPCOM_BLOCK_EDITOR_SET_GUIDE_RATING':
			return action.guideRating;
		default:
			return state;
	}
};

const shouldShowWpcomGuideVariantReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case 'WPCOM_BLOCK_EDITOR_SET_GUIDE_VARIANT':
			return action.showVariant;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	isNuxEnabled: isNuxEnabledReducer,
	isGuideManuallyOpened: isGuideManuallyOpenedReducer,
	guideRating: guideRatingReducer,
	shouldShowWpcomGuideVariant: shouldShowWpcomGuideVariantReducer,
} );

const actions = {
	// TODO: Improve variable naming of nux vs tour for consistency and to better reflect terminology in core: use nux for the user status flag and Guide to describe the React component (like in core)
	// isFeatureActive instead of isNuxEnabled would match core and make this logic easier to understand.
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
	setGuideRating: ( guideRating ) => {
		return { type: 'WPCOM_BLOCK_EDITOR_SET_GUIDE_RATING', guideRating };
	},
	setShouldShowWpcomGuideVariant: ( { showVariant } ) => {
		return {
			type: 'WPCOM_BLOCK_EDITOR_SET_GUIDE_VARIANT',
			showVariant,
		};
	},
	setGuideOpenStatus: ( { isGuideManuallyOpened } ) => {
		return {
			type: 'WPCOM_BLOCK_EDITOR_SET_GUIDE_OPEN',
			isGuideManuallyOpened,
		};
	},
};

const selectors = {
	isGuideManuallyOpened: ( state ) => state.isGuideManuallyOpened,
	isWpcomNuxEnabled: ( state ) => state.isNuxEnabled,
	guideRating: ( state ) => state.guideRating,
	shouldShowWpcomGuideVariant: ( state ) => state.shouldShowWpcomGuideVariant,
};

registerStore( 'automattic/nux', {
	reducer,
	actions,
	selectors,
	persist: true,
} );
