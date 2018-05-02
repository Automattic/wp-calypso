/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from 'me/controller';
import HappychatPage from 'blocks/happychat/chat-page';
import { setDocumentHeadTitle } from 'state/document-head/actions';
import { makeLayout, render as clientRender } from 'controller';
import PageViewTracker from 'lib/analytics/page-view-tracker';

const renderChat = ( context, next ) => {
	context.store.dispatch( setDocumentHeadTitle( translate( 'Chat', { textOnly: true } ) ) );
	context.primary = (
		<div>
			<PageViewTracker path="/me/chat" title="Chat" />
			<HappychatPage />
		</div>
	);
	next();
};

export default () => {
	if ( config.isEnabled( 'happychat' ) ) {
		page( '/me/chat', controller.sidebar, renderChat, makeLayout, clientRender );
	}
};
