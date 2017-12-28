/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'client/state/utils';
import { USER_DEVICES_ADD } from 'client/state/action-types';

export default createReducer(
	{},
	{
		[ USER_DEVICES_ADD ]: ( state, { devices } ) => ( { ...state, ...devices } ),
	}
);
