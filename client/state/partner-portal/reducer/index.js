/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import partners from 'calypso/state/partner-portal/reducer/partners';

const combinedReducer = combineReducers( {
	partners,
} );

export default withStorageKey( 'partnerPortal', combinedReducer );
