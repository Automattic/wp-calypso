/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import rewindStatus from './rewind-status/reducer';

export default combineReducers( {
	rewindStatus,
} );
