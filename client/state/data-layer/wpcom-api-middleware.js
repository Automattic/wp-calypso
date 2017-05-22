/**
 * Internal dependencies
 */
import { local, mergeHandlers } from './utils';

import httpHandlers from './wpcom-http';
import thirdPartyHandlers from './third-party';
import wpcomHandlers from './wpcom';

const mergedHandlers = mergeHandlers(
	httpHandlers,
	thirdPartyHandlers,
	wpcomHandlers,
);

/**
 * WPCOM Middleware API
 *
 * Intercepts actions requesting data provided by the
 * WordPress.com API and passes them off to the
 * appropriate handler.
 *
 * @see state/utils/local indicates that action should bypass data layer
 *
 * Note:
 *
 * This function has been optimized for speed and has
 * in turn sacrificed some readability. It's mainly
 * performing two checks:
 *
 *  - Are there handlers defined for the given action type?
 *  - Is there action meta indicating to bypass these handlers?
 *
 * The optimizations reduce function-calling and object
 * property lookup where possible.
 *
 * @param {Object<String,Function[]>} handlers map of action types to handlers
 * @returns {Function} middleware handler
 */
export const middleware = handlers => store => next => {
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

		// as we transition to making next() implicit we want
		// to limit the extent of our changes so make this new
		// function which gives us the ability to incrementally
		// remove the uses of `next( action )` inside the handlers
		//
		// this guarantees that we don't double-dispatch
		const nextActions = new Set();
		const safeNext = a => nextActions.add( a );

		handlerChain.forEach( handler => handler( store, action, safeNext ) );

		// make sure we pass along this action
		// eventually this will return to the
		// simpler `return next( action )`
		nextActions.add( action );
		nextActions.forEach( localNext );
	};
};

export default middleware( mergedHandlers );
