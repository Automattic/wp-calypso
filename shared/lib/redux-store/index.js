/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

/**
 * Internal dependencies
 */
import reducers from './reducers';

export default applyMiddleware(
	thunkMiddleware
)( createStore )( reducers );
