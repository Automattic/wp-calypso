/**
 * External dependencies
 */
import config from '@automattic/calypso-config';
// import { useSelector } from 'react-redux';
/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
// import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
// import { getSelectedSite } from 'calypso/state/ui/selectors';

export const sendSiteEditorBetaFeedback = ( message, port ) => {
	// TODO - hook up the selectors for site and locale data.
	// const kayakoMessage = `Site: ${ selectedSite ? selectedSite.URL : 'N/A' }\n\n${ message }`;
	const kayakoMessage = `Site: N/A\n\n${ message }`;

	// console.log( kayakoMessage );
	// port.postMessage( 'success' );

	wpcom.req
		.post( '/help/tickets/kayako/new', {
			subject: '[Dotcom FSE Beta]',
			message: kayakoMessage,
			locale: 'N/A',
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
