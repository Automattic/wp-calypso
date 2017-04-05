/**
 * External dependencies
 */
import { toPairs, fromPairs } from 'lodash';

/**
 * Internal dependencies
 */
import { local, mergeHandlers } from './utils';

const stripHandlersForKey = ( key, keyHandlers, keyHandlersToStrip ) => {
	const newKeyHandlers = (
		keyHandlersToStrip
			? keyHandlers.filter( ( handler ) => ! keyHandlersToStrip.includes( handler ) )
			: keyHandlers
	);

	return [ key, newKeyHandlers ];
};

const stripHandlers = ( handlers, handlersToStrip ) => {
	return fromPairs(
		toPairs( handlers ).map(
			( [ key, keyHandlers ] ) => stripHandlersForKey( key, keyHandlers, handlersToStrip[ key ] )
		)
	);
};

export const extensionsHandlers = () => {
	let handlers = {};

	/**
	 * Dynamically add handlers to this middleware.
	 *
	 * @function
	 * @param {Object} handlersToAdd The actions to be added.
	 * @return {Function} removeHandlers, removes the handlers that were added.
	 */
	const addHandlers = ( handlersToAdd ) => {
		handlers = mergeHandlers( handlers, handlersToAdd );

		return function removeHandlers() {
			handlers = stripHandlers( handlers, handlersToAdd );
		};
	};

	/**
	 * WPCOM Extensions Middleware
	 *
	 * Intercepts actions requesting data for extensions
	 * and passes them to the appropriate handler.
	 *
	 * This code patterns off of datalayer wpcom-api-middleware
	 * @see state/data-layer/wpcom-api-middleware
	 *
	 * @param {Object} store Common `store => next => action` pattern for middlewares.
	 * @return {Function} middleware handler
	 */
	const middleware = store => next => {
		const localNext = action => next( local( action ) );

		/**
		 * Middleware handler
		 *
		 * @function
		 * @param {Object} action Redux action
		 * @returns {undefined} please do not use
		 */
		return action => {
			const handlerChain = handlers[ action.type ];

			// if no handler is defined for the action type
			// then pass it along the chain untouched
			if ( ! handlerChain ) {
				return next( action );
			}

			const meta = action.meta;
			if ( meta ) {
				const dataLayer = meta.dataLayer;

				// if the action indicates that we should
				// bypass the data layer, then pass it
				// along the chain untouched
				if ( dataLayer && true === dataLayer.doBypass ) {
					return next( action );
				}
			}

			return handlerChain.forEach( handler => handler( store, action, localNext ) );
		};
	};

	return { middleware, addHandlers };
};

const instance = extensionsHandlers();

export default instance.middleware;
export const addHandlers = instance.addHandlers;

