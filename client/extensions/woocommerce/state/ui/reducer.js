/**
 * Internal dependencies
 */
import payments from './payments/reducer';
import products from './products/reducer';
import shipping from './shipping/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	payments,
	products,
	shipping,
} );
