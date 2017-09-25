/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Happychat from './main';
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import controller from 'me/controller';
import { setDocumentHeadTitle } from 'state/document-head/actions';

const renderChat = ( context ) => {
	context.store.dispatch( setDocumentHeadTitle( translate( 'Chat', { textOnly: true } ) ) );
	renderWithReduxStore(
		<Happychat />,
		document.getElementById( 'primary' ),
		context.store
	);
};

export default () => {
	if ( config.isEnabled( 'happychat' ) ) {
		page( '/me/chat', controller.sidebar, renderChat );
	}
};
