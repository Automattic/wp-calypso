/**
 * Internal dependencies
 */
import { mergeHandlers } from './utils';
import thirdParty from './third-party';

const mergedHandlers = mergeHandlers(
	thirdParty,
);

/**
 * Action-watching middleware
 *
 * Execute action-watching "handlers" when actions
 * of a given type fly through the Redux store
 *
 * @param {Object<String,Function[]>} handlers map of action types to handlers
 * @returns {Function} action-watching middleware
 */
export const middleware = handlers => store => next => action => {
	const handlerChain = handlers[ action.type ];

	// if no handler is defined for the action type
	// then pass it along the chain untouched
	if ( ! handlerChain ) {
		return next( action );
	}

	return handlerChain.forEach( handler => handler( store, action ) );
};

export default middleware( mergedHandlers );
