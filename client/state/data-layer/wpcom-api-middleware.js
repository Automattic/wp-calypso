/**
 * Internal dependencies
 */
import thirdPartyHandlers from './third-party';
import { bypassDataLayer } from './utils';
import wpcomHandlers from './wpcom';
import wpcomHttpHandlers from './wpcom-http';
import { mergeHandlers } from 'state/action-watchers/utils';
import httpHandlers from 'state/http';

const mergedHandlers = mergeHandlers(
	httpHandlers,
	wpcomHttpHandlers,
	thirdPartyHandlers,
	wpcomHandlers,
);

const shouldNext = action => {
	const meta = action.meta;
	if ( ! meta ) {
		return true;
	}

	const data = meta.dataLayer;
	if ( ! data ) {
		return true;
	}

	// is a network response, don't reissue
	if ( data.data || data.error || data.headers || data.progress ) {
		return false;
	}

	return true;
};

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

		handlerChain.forEach( handler => handler( store, action ) );

		if ( shouldNext( action ) ) {
			next( bypassDataLayer( action ) );
		}
	};
};

export default middleware( mergedHandlers );
