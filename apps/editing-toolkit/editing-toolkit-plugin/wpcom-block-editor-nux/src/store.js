/**
 * External dependencies
 */
import 'a8c-fse-common-data-stores';
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

const reducer = combineReducers( {
	isNuxEnabled: isNuxEnabledReducer,
	isGuideManuallyOpened: isGuideManuallyOpenedReducer,
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
};

registerStore( 'automattic/nux', {
	reducer,
	actions,
	selectors,
	persist: true,
} );
