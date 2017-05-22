/**
 * Internal dependencies
 */
import products from './products/reducer';
import shipping from './shipping/reducer';
import { combineReducersWithPersistence } from 'state/utils';

export default combineReducersWithPersistence( {
	products,
	shipping,
} );
