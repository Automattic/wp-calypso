/**
 * Internal dependencies
 */
import {
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
} from 'state/action-types';
import { pauseAll, resumePaused } from 'lib/data-poller';

export const handlers = {
	[ THEME_TRANSFER_INITIATE_REQUEST ]: pauseAll,
	[ THEME_TRANSFER_INITIATE_FAILURE ]: resumePaused,
	[ THEME_TRANSFER_INITIATE_SUCCESS ]: resumePaused
};

/**
 * Middleware
 */

export default ( { dispatch, getState } ) => ( next ) => ( action ) => {
	if ( handlers.hasOwnProperty( action.type ) ) {
		handlers[ action.type ]( dispatch, action, getState );
	}

	return next( action );
};
