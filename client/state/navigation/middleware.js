/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	NAVIGATE_TO_ROUTE,
} from 'state/action-types';

export default ( store, next, action ) => {
	if ( NAVIGATE_TO_ROUTE === action.type ) {
		page( action.route );
	}

	return next( action );
};
