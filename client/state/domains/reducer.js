/**
 * Internal dependencies
 */
import management from './management/reducer';
import suggestions from './suggestions/reducer';
import { combineReducersWithPersistence } from 'state/utils';

export default combineReducersWithPersistence( {
	management
	suggestions
} );
