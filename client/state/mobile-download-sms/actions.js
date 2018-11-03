/** @format */

/**
 * Internal dependencies
 */

import { GET_APPS_SMS_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/me/get-apps/send-download-sms';

export function sendSMS( phone ) {
	return {
		type: GET_APPS_SMS_REQUEST,
		phone: phone,
	};
}
