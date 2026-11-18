import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { conversationsInbox } from './controller';

export default function () {
	// Routes registered with plain `page.redirect` aren't known to the Reader's 404 catch-all.
	const redirectToInbox = () => page.redirect( '/reader/conversations/inbox' );
	readerPage( '/reader/conversations', redirectToInbox );
	readerPage( '/reader/conversations/a8c', redirectToInbox );

	readerPage(
		'/reader/conversations/inbox/:siteId?/:postId?',
		sidebar,
		conversationsInbox,
		makeLayout,
		clientRender
	);
}
