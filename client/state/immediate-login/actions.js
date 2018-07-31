/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { SAVE_IMMEDIATE_LOGIN_INFORMATION } from './constants';

/**
 * Stores immediate link-related information in state so it can be reused later
 *
 * @param  {string} reason - Reason for this immediate login
 * @return {void}
 */
export const saveImmediateLoginInformation = reason => dispatch => {
	dispatch( {
		type: SAVE_IMMEDIATE_LOGIN_INFORMATION,
		reason,
	} );
};
