/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { followingManage } from './controller';
import { initAbTests, updateLastRoute, sidebar } from 'reader/controller';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';

export default function() {
	page( '/following/*', initAbTests );
	page(
		'/following/manage',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		followingManage,
		makeLayout,
		clientRender
	);
	page.redirect( '/following/edit*', '/following/manage' );
}
