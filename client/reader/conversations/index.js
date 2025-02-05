import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { conversations, conversationsA8c } from './controller';

export default function () {
	page(
		'/reader/conversations',
		updateLastRoute,
		sidebar,
		conversations,
		makeLayout,
		clientRender
	);

	page(
		'/reader/conversations/a8c',
		updateLastRoute,
		sidebar,
		conversationsA8c,
		makeLayout,
		clientRender
	);
}
