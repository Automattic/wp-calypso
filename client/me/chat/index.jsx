/*
	External Deps
*/
import React from 'react';
import page from 'page';

/*
	Internal deps
*/
import { renderWithReduxStore } from 'lib/react-helpers';
import controller from 'me/controller';
import LiveChat from 'components/happychat/page';

const renderChat = ( context, next ) => {
	renderWithReduxStore(
		<LiveChat />,
		document.getElementById( 'primary' ),
		context.store
	);
	next();
};

export default () => {
	page( '/me/chat', controller.sidebar, renderChat );
};
