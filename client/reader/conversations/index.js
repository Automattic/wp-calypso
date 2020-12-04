/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { conversations, conversationsA8c } from './controller';
import { initAbTests, sidebar, updateLastRoute } from 'calypso/reader/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default function () {
	page(
		'/read/conversations',
		updateLastRoute,
		initAbTests,
		sidebar,
		conversations,
		makeLayout,
		clientRender
	);

	page(
		'/read/conversations/a8c',
		updateLastRoute,
		initAbTests,
		sidebar,
		conversationsA8c,
		makeLayout,
		clientRender
	);
}
