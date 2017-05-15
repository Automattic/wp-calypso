/**
 * Internal dependencies
 */
import {
	AUTOMATED_TRANSFER_STATUS_SET,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
} from 'state/action-types';
import { pauseAll, resumePaused } from 'lib/data-poller';

const pauseFetching = () => {
	pauseAll();
	const sites = require( 'lib/sites-list' )();
	sites.pauseFetching();
};

const resumeFetching = () => {
	resumePaused();
	const sites = require( 'lib/sites-list' )();
	sites.resumeFetching();
};

export const handlers = {
	[ THEME_TRANSFER_INITIATE_REQUEST ]: pauseFetching,
	[ THEME_TRANSFER_INITIATE_FAILURE ]: resumeFetching,
	[ THEME_TRANSFER_INITIATE_SUCCESS ]: resumeFetching,
	[ AUTOMATED_TRANSFER_STATUS_SET ]: ( dispatch, { status } ) => {
		if ( 'complete' === status ) {
			resumeFetching();
		} else if ( 'start' === status ) {
			pauseFetching();
		}
	}
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
