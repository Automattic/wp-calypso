/**
 * Internal dependencies
 */
import products from './products/reducer';
import shipping from './shipping/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	products,
	shipping,
} );
