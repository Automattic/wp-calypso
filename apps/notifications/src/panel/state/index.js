import { applyMiddleware, combineReducers, compose, createStore } from 'redux'; // eslint-disable-line no-restricted-imports
import thunkMiddleware from 'redux-thunk';
import actionMiddleware from './action-middleware';
import { createListenerMiddleware } from './create-listener-middleware';
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

const listenerMiddleware = createListenerMiddleware();
const withMiddleware = ( customMiddleware ) =>
	composeEnhancers(
		applyMiddleware( thunkMiddleware, listenerMiddleware, actionMiddleware( customMiddleware ) )
	)( createStore );

const store = init();

// Note: this function has the unexpected side effect of modifying
// the `store` export. In order to maintain behaviour for consumers,
// it's being kept this way, but beware this is not a pure function.
function init( { customEnhancer, customMiddleware = {} } = {} ) {
	const middle = withMiddleware( customMiddleware );
	const create = customEnhancer ? customEnhancer( middle ) : middle;

	return create( reducer, reducer( undefined, { type: '@@INIT' } ) );
}

export { store, init };
