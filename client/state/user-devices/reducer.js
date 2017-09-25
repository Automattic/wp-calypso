/**
 * Internal dependencies
 */
import { USER_DEVICES_ADD } from 'state/action-types';
import { createReducer } from 'state/utils';

export default createReducer( {}, {
	[ USER_DEVICES_ADD ]: ( state, { devices } ) => ( { ...state, ...devices } )
} );
