/**
 * Internal dependencies
 */
import images from './images/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import items from './items/reducer';

export default combineReducersWithPersistence( {
	images,
	items,
} );
