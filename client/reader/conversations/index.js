import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { conversationsA8c, conversationsInbox } from './controller';

export default function () {
	page.redirect( '/reader/conversations', '/reader/conversations/inbox' );

	readerPage( '/reader/conversations/a8c', sidebar, conversationsA8c, makeLayout, clientRender );

	readerPage(
		'/reader/conversations/inbox/:siteId?/:postId?',
		sidebar,
		conversationsInbox,
		makeLayout,
		clientRender
	);
}
