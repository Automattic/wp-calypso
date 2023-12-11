import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import {
	createList,
	deleteList,
	editList,
	editListItems,
	exportList,
	listListing,
} from './controller';

export default function () {
	if ( config.isEnabled( 'reader/list-management' ) ) {
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

		page( '/read/list/new', updateLastRoute, sidebar, createList, makeLayout, clientRender );

		page(
			'/read/list/:user/:list/export',
			updateLastRoute,
			sidebar,
			exportList,
			makeLayout,
			clientRender
		);

		page(
			'/read/list/:user/:list/delete',
			updateLastRoute,
			sidebar,
			deleteList,
			makeLayout,
			clientRender
		);
	}

	page( '/read/list/:user/:list', updateLastRoute, sidebar, listListing, makeLayout, clientRender );
}
