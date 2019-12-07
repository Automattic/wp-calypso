/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import backups from './backups/reducer';
import state from './state/reducer';

const rewind = combineReducers( {
	backups,
	state,
} );

export default keyedReducer( 'siteId', rewind );
