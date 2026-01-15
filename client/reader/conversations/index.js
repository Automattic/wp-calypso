import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import { conversations, conversationsA8c } from './controller';

export default function () {
	page(
		'/reader/conversations',
		sidebar,
		setBeforePrimary,
		conversations,
		makeLayout,
		clientRender
	);

	page(
		'/reader/conversations/a8c',
		sidebar,
		setBeforePrimary,
		conversationsA8c,
		makeLayout,
		clientRender
	);
}
