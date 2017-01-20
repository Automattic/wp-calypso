/**
 * Internal dependencies
 */
import handlerMap from './wpcom';
import { local } from './utils';

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
 */
export const middleware = handlers => store => next => {
	const localNext = action => next( local( action ) );

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
			if ( true === dataLayer.doBypass ) {
				return next( action );
			}
		}

		return handlerChain.forEach( handler => handler( store, action, localNext ) );
	}
};

export default middleware( handlerMap );
