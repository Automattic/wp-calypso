/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { conversations, conversationsA8c } from './controller';
import { initAbTests, preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'reader/conversations' ) ) {
		page(
			'/read/conversations',
			preloadReaderBundle,
			updateLastRoute,
			initAbTests,
			sidebar,
			conversations,
			makeLayout,
			clientRender
		);

		page(
			'/read/conversations/a8c',
			preloadReaderBundle,
			updateLastRoute,
			initAbTests,
			sidebar,
			conversationsA8c,
			makeLayout,
			clientRender
		);
	} else {
		page( '/read/conversations', '/' );
		page( '/read/conversations/a8c', '/' );
	}
}
