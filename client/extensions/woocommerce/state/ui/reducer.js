/**
 * Internal dependencies
 */
import products from './products/reducer';
import { combineReducersWithPersistence } from 'state/utils';

export default combineReducersWithPersistence( {
	products
} );
