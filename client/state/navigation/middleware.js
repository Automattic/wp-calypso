/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { NAVIGATE } from 'state/action-types';

export const navigationMiddleware = () => {
	return ( next ) => ( action ) => {
		if ( action.type === NAVIGATE && action.path ) {
			page( action.path );
		}

		return next( action );
	};
};

export default navigationMiddleware;
