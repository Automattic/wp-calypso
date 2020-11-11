/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withStorageKey } from 'calypso/state/utils';
import backups from './backups/reducer';
import capabilities from './capabilities/reducer';
import state from './state/reducer';

const rewind = combineReducers( {
	backups,
	capabilities,
	state,
} );

const reducer = keyedReducer( 'siteId', rewind );

export default withStorageKey( 'rewind', reducer );
