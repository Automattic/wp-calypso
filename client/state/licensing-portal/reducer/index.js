/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import partners from 'calypso/state/licensing-portal/reducer/partners';

const combinedReducer = combineReducers( {
	partners,
} );

export default withStorageKey( 'licensingPortal', combinedReducer );
