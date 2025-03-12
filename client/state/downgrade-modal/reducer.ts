/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { DOWNGRADE_MODAL_OPEN, DOWNGRADE_MODAL_CLOSE } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { PlanSlug } from '@automattic/calypso-products';
import type { AnyAction } from 'redux';

export interface DowngradeModalState {
	isOpen: boolean;
	toPlanSlug: PlanSlug | null;
}

const initialState: DowngradeModalState = {
	isOpen: false,
	toPlanSlug: null,
};

export function downgradeModal( state = initialState, action: AnyAction ): DowngradeModalState {
	switch ( action.type ) {
		case DOWNGRADE_MODAL_OPEN:
			return {
				isOpen: true,
				toPlanSlug: action.toPlanSlug,
			};
		case DOWNGRADE_MODAL_CLOSE:
			return {
				...state,
				isOpen: false,
			};
		default:
			return state;
	}
}

export default combineReducers( {
	ui: downgradeModal,
} );
