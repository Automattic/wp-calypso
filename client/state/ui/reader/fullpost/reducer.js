/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_FULLPOST_SHOW,
	READER_FULLPOST_HIDE
} from 'state/action-types';

export function isVisible( state = false, action ) {
	switch ( action.type ) {
		case READER_FULLPOST_SHOW:
			return true;
		case READER_FULLPOST_HIDE:
			return false;
	}

	return state;
}

export default combineReducers( {
	isVisible
} );

