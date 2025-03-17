import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import {
	createList,
	deleteList,
	editList,
	editListItems,
	exportList,
	listListing,
} from './controller';

export default function () {
	page( '/reader/list/:user/:list/edit/items', sidebar, editListItems, makeLayout, clientRender );
	page( '/reader/list/:user/:list/edit', sidebar, editList, makeLayout, clientRender );

	page( '/reader/list/new', sidebar, createList, makeLayout, clientRender );

	page( '/reader/list/:user/:list/export', sidebar, exportList, makeLayout, clientRender );

	page( '/reader/list/:user/:list/delete', sidebar, deleteList, makeLayout, clientRender );

	page( '/reader/list/:user/:list', sidebar, listListing, makeLayout, clientRender );
}
