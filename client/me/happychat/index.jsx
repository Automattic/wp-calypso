/*
	External Deps
*/
import React from 'react';
import page from 'page';
import { translate } from 'i18n-calypso';

/*
	Internal deps
*/
import { renderPage } from 'lib/react-helpers';
import controller from 'me/controller';
import Happychat from './main';
import { setDocumentHeadTitle } from 'state/document-head/actions';

const renderChat = ( context ) => {
	context.store.dispatch( setDocumentHeadTitle( translate( 'Chat', { textOnly: true } ) ) );
	renderPage(
		<Happychat />,
		context
	);
};

export default () => {
	page( '/me/chat', controller.sidebar, renderChat );
};
