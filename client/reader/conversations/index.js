import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { conversations, conversationsA8c } from './controller';

export default function () {
	page( '/read/conversations', updateLastRoute, sidebar, conversations, makeLayout, clientRender );

	page(
		'/read/conversations/a8c',
		updateLastRoute,
		sidebar,
		conversationsA8c,
		makeLayout,
		clientRender
	);
}
