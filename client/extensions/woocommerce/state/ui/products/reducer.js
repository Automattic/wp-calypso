/**
 * Internal dependencies
 */
import edits from './edits-reducer';
import { combineReducersWithPersistence } from 'state/utils';
import variations from './variations/reducer';

export default combineReducersWithPersistence( {
	edits,
	variations,
} );
