/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { USER_DEVICES_ADD } from 'state/action-types';

export default createReducer(
	{},
	{
		[ USER_DEVICES_ADD ]: ( state, { devices } ) => ( { ...state, ...devices } ),
	}
);
