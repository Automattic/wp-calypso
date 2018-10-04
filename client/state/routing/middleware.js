/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { savePath } from 'lib/restore-last-path';
import { ROUTE_SET } from 'state/action-types';

const debug = debugFactory( 'calypso:restore-last-location' );

export const routingMiddleware = () => {
	return next => action => {
		if ( action.type !== ROUTE_SET || ! action.path || ! isEmpty( action.query ) ) {
			return next( action );
		}

		// Attempt to save the path so it might be restored in the future
		savePath( action.path )
			.then( result => debug( result ) )
			.catch( reason => debug( reason ) );

		next( action );
	};
};

export default routingMiddleware;
