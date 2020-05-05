/**
 * External dependencies
 */
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'; //eslint-disable-line no-restricted-imports

/**
 * Internal dependencies
 */
import actionMiddleware from './action-middleware';
import notes from './notes/reducer';
import suggestions from './suggestions/reducer';
import ui from './ui/reducer';

const reducer = combineReducers( {
	notes,
	suggestions,
	ui,
} );

/** @see https://github.com/zalmoxisus/redux-devtools-extension */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const withMiddleware = ( customMiddleware ) =>
	composeEnhancers( applyMiddleware( actionMiddleware( customMiddleware ) ) )( createStore );

let store = null;
init();

// Note: this function has the unexpected side effect of modifying
// the `store` export. In order to maintain behaviour for consumers,
// it's being kept this way, but beware this is not a pure function.
function init( { customEnhancer, customMiddleware = {} } = {} ) {
	const middle = withMiddleware( customMiddleware );
	const create = customEnhancer ? customEnhancer( middle ) : middle;

	store = create( reducer, reducer( undefined, { type: '@@INIT' } ) );
	return store;
}

export { store, init };
