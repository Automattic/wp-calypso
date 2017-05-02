/**
 * Internal dependencies
 */
import suggestions from './suggestions/reducer';
import { combineReducersWithPersistence } from 'state/utils';

export default combineReducersWithPersistence( {
	suggestions
} );
