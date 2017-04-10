/**
 * Internal dependencies
 */
import { mergeHandlers } from './utils';
import { middleware } from './wpcom-api-middleware';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:state:data-layer' );
let extensionHandlers = Object.create( null );
let handlerMiddleware = buildMiddleware( extensionHandlers );

export function addHandlers( extensionName, handlers, existingHandlers = extensionHandlers ) {
	if ( Object.keys( existingHandlers ).includes( extensionName ) ) {
		throw new Error( `Handlers for extension ${ extensionName } already present.` );
	}

	// Set the module globals for convenience
	extensionHandlers = { ...existingHandlers, [ extensionName ]: handlers };
	handlerMiddleware = buildMiddleware( extensionHandlers );

	return extensionHandlers;
}

export function removeHandlers( extensionName, existingHandlers = extensionHandlers ) {
	const { [ extensionName ]: omitted, ...remainingHandlers } = existingHandlers;

	if ( ! omitted ) {
		debug( `Trying to remove nonexistent handlers for ${ extensionName }` );
	}

	// Set the module globals for convenience
	extensionHandlers = remainingHandlers;
	handlerMiddleware = buildMiddleware( extensionHandlers );

	return extensionHandlers;
}

export function buildMiddleware( handlersByExtension ) {
	const allHandlers = Object.values( handlersByExtension ).reduce(
		( accumulated, handlers ) => {
			return mergeHandlers( accumulated, handlers );
		},
		{}
	);

	return middleware( allHandlers );
}

/**
 * Extensions Middleware
 * @function
 * @param {Object} store The store for the middleware chain.
 * @returns {Function} The next => action part of the middleware.
 */
export default store => next => action => {
	return handlerMiddleware( store )( next )( action );
};

