/**
 * Internal dependencies
 */
import edits from './edits-reducer';
import { combineReducersWithPersistence } from 'state/utils';

export default combineReducersWithPersistence( {
	edits
} );
