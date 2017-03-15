/**
 * Internal dependencies
 */
import {
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
} from 'state/action-types';

const pauseFetching = ( dispatch, { status } ) => {
	const sites = require( 'lib/sites-list' )();
	sites.pauseFetching();
};

const resumeFetching = ( dispatch, { status } ) => {
	const sites = require( 'lib/sites-list' )();
	sites.resumeFetching();
};

export const handlers = {
	[ THEME_TRANSFER_INITIATE_REQUEST ]: pauseFetching,
	[ THEME_TRANSFER_INITIATE_FAILURE ]: resumeFetching,
	[ THEME_TRANSFER_INITIATE_SUCCESS ]: resumeFetching
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
