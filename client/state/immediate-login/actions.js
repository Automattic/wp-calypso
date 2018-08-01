/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { IMMEDIATE_LOGIN_SAVE_STATUS } from 'state/action-types';

/**
 * Stores immediate link-related information in state so it can be reused later
 *
 * @param  {string} reason - Reason for this immediate login
 * @return {void}
 */
export const saveImmediateLoginInformation = reason => dispatch => {
	dispatch( {
		type: IMMEDIATE_LOGIN_SAVE_STATUS,
		reason,
	} );
};
