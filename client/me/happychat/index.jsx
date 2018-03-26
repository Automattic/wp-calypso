/** @format */

/**
 * External dependencies
 */
import page from 'page';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from 'me/controller';
import { setDocumentHeadTitle } from 'state/document-head/actions';
import { makeLayout, render as clientRender } from 'controller';
import HappychatClient from 'happychat-client';

const renderChat = ( context, next ) => {
	context.store.dispatch( setDocumentHeadTitle( translate( 'Chat', { textOnly: true } ) ) );
	HappychatClient.open( {
		nodeId: 'primary',
		accessToken: 'your-happychat-client-oauth-token',
		entry: 'chat',
	} );
	next();
};

export default () => {
	if ( config.isEnabled( 'happychat' ) ) {
		page( '/me/chat', controller.sidebar, renderChat, makeLayout, clientRender );
	}
};
