/**
 * External dependencies
 */
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'; //eslint-disable-line wpcalypso/import-no-redux-combine-reducers

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
const withMiddleware = customMiddleware =>
	composeEnhancers( applyMiddleware( actionMiddleware( customMiddleware ) ) )( createStore );

export let store = init();

export function init( { customEnhancer, customMiddleware = {} } = {} ) {
	const middle = withMiddleware( customMiddleware );
	const create = customEnhancer ? customEnhancer( middle ) : middle;

	store = create( reducer, reducer( undefined, { type: '@@INIT' } ) );

	return store;
}
