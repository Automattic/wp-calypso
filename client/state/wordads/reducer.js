/**
 * Internal dependencies
 */
import approve from './approve/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import status from './status/reducer';

export default combineReducersWithPersistence( {
	approve,
	status
} );
