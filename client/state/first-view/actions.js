/**
 * Internal dependencies
 */

import {
	FIRST_VIEW_HIDE,
} from 'state/action-types';

import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

export function disableView( { view } ) {
	return ( dispatch, getState ) => {
		dispatch( persistToPreferences( { getState, view, disabled: true } ) );
	};
}

export function enableView( { view } ) {
	return ( dispatch, getState ) => {
		dispatch( persistToPreferences( { getState, view, disabled: false } ) );
	};
}

export function hideView( { view } ) {
	return {
		type: FIRST_VIEW_HIDE,
		view,
	};
}

function persistToPreferences( { getState, view, disabled } ) {
	return savePreference( 'firstViewHistory', [
		...getPreference( getState(), 'firstViewHistory' ), {
			view,
			timestamp: Date.now(),
			disabled,
		}
	] );
}
