import notes from './notes';
import overrides from './overrides';
import suggestions from './suggestions';
import ui from './ui';
import { mergeHandlers } from './utils';

const mergedHandlers = mergeHandlers( notes, overrides, suggestions, ui );

export const middleware = ( handlers ) => ( store ) => ( next ) => ( action ) => {
	const handlerChain = handlers[ action.type ];

	// if no handler is defined for the action type
	// then pass it along the chain untouched
	if ( ! handlerChain ) {
		return next( action );
	}

	handlerChain.forEach( ( handler ) => handler( store, action ) );

	return next( action );
};

export default ( customMiddleware = {} ) =>
	middleware( mergeHandlers( customMiddleware, mergedHandlers ) );
