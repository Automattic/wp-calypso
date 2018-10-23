/** @format */

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

/**
 * Send an SMS to the provdied phone number with a link to download the apps.
 *
 * @param {string} phoneNumber - The complete phone number, with numeric country code
 *
 * @return {Promise} A promise for the request
 */
export function sendSMS( phoneNumber ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/get-apps/send-download-sms',
		body: {
			phone_number: phoneNumber,
		},
	};

	return wpcom.req.post( args );
}
