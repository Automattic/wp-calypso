/**
 * External dependencies
 */
import config from '@automattic/calypso-config';
/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const noop = () => {};

/**
 *
 * @param {string}	 message 	 	The user's feedback message to send.
 * @param {string} 	 siteUrl 	 	The current site Url.
 * @param {string} 	 userLocale  	The user's locale.
 * @param {Function} handleSuccess	Function to handle response of post request.
 * @param {Function} handleError 	Function to handle error in post request.
 */
export const sendSiteEditorBetaFeedback = (
	message,
	siteUrl,
	userLocale,
	handleSuccess = noop,
	handleError = noop
) => {
	const kayakoMessage = `Site: ${ siteUrl ? siteUrl : 'N/A' }\n\n${ message }`;

	wpcom.req
		.post( '/help/tickets/kayako/new', {
			subject: '[Dotcom FSE Beta]',
			message: kayakoMessage,
			locale: userLocale,
			client: config( 'client_slug' ),
			is_chat_overflow: false,
		} )
		.then( handleSuccess )
		.catch( handleError );
};
