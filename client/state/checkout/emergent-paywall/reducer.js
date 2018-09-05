/** @format */

/**
 * Internal dependencies
 */

import { EMERGENT_PAYWALL_RECEIVE } from 'state/action-types';

/**
 * Returns the updated emergent paywall iframe configuration state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object} Updated state
 */
export default function( state = {}, action ) {
	switch ( action.type ) {
		case EMERGENT_PAYWALL_RECEIVE:
			return {
				chargeId: action.charge_id,
				payload: action.payload,
				signature: action.signature,
				url: action.paywall_url,
			};
	}
	return state;
}
