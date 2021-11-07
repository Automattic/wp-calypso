import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { sidebar } from 'calypso/me/controller';
import { setDocumentHeadTitle } from 'calypso/state/document-head/actions';
import Happychat from './main';

const renderChat = ( context, next ) => {
	context.store.dispatch( setDocumentHeadTitle( translate( 'Chat', { textOnly: true } ) ) );
	context.primary = (
		<div>
			<PageViewTracker path="/me/chat" title="Chat" />
			<Happychat />
		</div>
	);
	next();
};

export default () => {
	if ( config.isEnabled( 'happychat' ) ) {
		page( '/me/chat', sidebar, renderChat, makeLayout, clientRender );
	}
};
