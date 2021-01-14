/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { registerStore } from '@wordpress/data';

const reducer = ( state = {}, action ) => {
	switch ( action.type ) {
		case 'WPCOM_BLOCK_EDITOR_NUX_SET_STATUS':
			return { ...state, isNuxEnabled: action.isNuxEnabled };
		case 'WPCOM_BLOCK_EDITOR_SET_GUIDE_OPEN':
			return { ...state, isGuideManuallyOpened: action.isGuideManuallyOpened };
		default:
			return state;
	}
};

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
