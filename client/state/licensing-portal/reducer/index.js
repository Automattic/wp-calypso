/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import partners from 'calypso/state/licensing-portal/reducer/partners';
import inspectLicense from 'calypso/state/licensing-portal/reducer/inspect-license';

const combinedReducer = combineReducers( {
	partners,
	inspectLicense,
} );

export default withStorageKey( 'licensingPortal', combinedReducer );
