/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { rememberedPosts } from './controller';
import { initAbTests, preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'reader/remembered-posts' ) ) {
		page(
			'/read/remembered-posts',
			preloadReaderBundle,
			updateLastRoute,
			initAbTests,
			sidebar,
			rememberedPosts,
			makeLayout,
			clientRender
		);
	} else {
		page( '/read/remembered-posts', '/' );
	}
}
