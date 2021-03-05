/**
 * External dependencies
 */
import xmpp from 'xmpp.js';

const domain = 'im.wordpress.com';

export const listenForSMS = function ( user ) {
	const jabberId = user.username + '@' + domain;
	const password = user.applicationPassword;
	const client = new xmpp.Client( { jid: jabberId } );

	client.plugin( require( '@xmpp/plugins/starttls' ) );
	client.plugin( require( '@xmpp/plugins/session-establishment' ) );

	client.start( { uri: 'xmpp://xmpp.wordpress.com', domain: domain } );

	client.on( 'stanza', ( stanza ) => {
		if (
			stanza.is( 'presence' ) &&
			stanza.getAttr( 'from' ) &&
			stanza.getAttr( 'from' ).indexOf( jabberId ) === 0
		) {
			client.emit( 'e2e:ready' );
			return;
		}
		if ( ! stanza.is( 'message' ) || stanza.getAttr( 'from' ) !== 'wpcom@im.wordpress.com' ) {
			return;
		}
		const body = stanza.getChild( 'body' );
		if ( ! body ) {
			return;
		}
		const messageText = body.getText();
		const smsContentRegex = /^SMS received from (\+?\d+): (.*)$/.exec( messageText );
		if ( ! smsContentRegex || ! smsContentRegex[ 2 ] ) {
			return;
		}
		const sms = {
			from: smsContentRegex[ 1 ],
			body: smsContentRegex[ 2 ],
		};
		client.emit( 'e2e:sms', sms );
	} );

	client.handle( 'authenticate', ( authenticate ) => authenticate( jabberId, password ) );

	client.on( 'online', () => {
		client.send( xmpp.xml( 'presence', { 'xml:lang': 'en' } ) );
	} );

	return client;
};
