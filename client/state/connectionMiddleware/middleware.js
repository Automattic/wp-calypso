/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

const connections = {};

export const connectionMiddleware = store => next => action => {
	if ( connections.hasOwnProperty( action.type ) ) {
		connections[ action.type ].connectionFunction( wpcom )( action, store.dispatch );
		next( action );
	} else {
		next( action );
	}
};

export function registerConnection( actionType, connectionFunction, options = {} ) {
	connections[ actionType ] = Object.assign( { connectionFunction }, options );
}
