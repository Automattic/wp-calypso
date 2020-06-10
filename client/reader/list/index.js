/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { editList, editListItems, listListing } from './controller';
import { sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page(
		'/read/list/:user/:list/edit/items',
		updateLastRoute,
		sidebar,
		editListItems,
		makeLayout,
		clientRender
	);
	page(
		'/read/list/:user/:list/edit',
		updateLastRoute,
		sidebar,
		editList,
		makeLayout,
		clientRender
	);
	page( '/read/list/:user/:list', updateLastRoute, sidebar, listListing, makeLayout, clientRender );
}
