/**
 * Internal dependencies
 */
import currency from './currency/reducer';
import methods from './methods/reducer';
import { combineReducers, keyedReducer } from 'state/utils';

const methodsReducer = combineReducers( {
	currency,
	methods,
} );

export default keyedReducer( 'siteId', methodsReducer );
