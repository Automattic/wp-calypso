/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { listListing } from './controller';
import { sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';

export default function() {
	page(
		'/read/list/:user/:list',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		listListing,
		makeLayout,
		clientRender
	);
}
