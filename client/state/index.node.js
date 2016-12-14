/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

/**
 * Internal dependencies
 */
import noticesMiddleware from './notices/middleware';
import reducer from './reducer';

export default function createReduxStore( initialState ) {
	return applyMiddleware( thunkMiddleware, noticesMiddleware )( createStore )( reducer, initialState );
}
