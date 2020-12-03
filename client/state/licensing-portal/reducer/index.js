/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import inspectLicense from './inspect-license';

const combinedReducer = combineReducers( {
	inspectLicense,
} );

export default withStorageKey( 'jetpackLicensing', combinedReducer );
