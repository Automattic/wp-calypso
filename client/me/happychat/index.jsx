/**
 * /*
 * 	External Deps
 *
 * @format
 */

import React from 'react';
import page from 'page';
import { translate } from 'i18n-calypso';

/*
	Internal deps
*/
import config from 'config';
import controller from 'me/controller';
import Happychat from './main';
import { setDocumentHeadTitle } from 'state/document-head/actions';
import { makeLayout, render as clientRender } from 'controller';

const renderChat = ( context, next ) => {
	context.store.dispatch( setDocumentHeadTitle( translate( 'Chat', { textOnly: true } ) ) );
	context.primary = <Happychat />;
	next();
};

export default () => {
	if ( config.isEnabled( 'happychat' ) ) {
		page( '/me/chat', controller.sidebar, renderChat, makeLayout, clientRender );
	}
};
