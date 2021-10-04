/**
 * External dependencies
 */
import config from '@automattic/calypso-config';
/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export const sendSiteEditorBetaFeedback = ( message, siteUrl, userLocale, port ) => {
	const kayakoMessage = `Site: ${ siteUrl ? siteUrl : 'N/A' }\n\n${ message }`;

	// To test without sending.
	// console.log( 'test message:' );
	// console.log( kayakoMessage );
	// port.postMessage( 'success' );
	// return;

	wpcom.req
		.post( '/help/tickets/kayako/new', {
			subject: '[Dotcom FSE Beta]',
			message: kayakoMessage,
			locale: userLocale,
			client: config( 'client_slug' ),
			is_chat_overflow: false,
		} )
		.then( () => {
			port.postMessage( 'success' );
		} )
		.catch( ( error ) => {
			port.postMessage( 'error' );
		} );
};
