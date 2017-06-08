/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import methods from './methods/reducer';

const methodsReducer = combineReducers( {
	methods,
} );

export default keyedReducer( 'siteId', methodsReducer );
