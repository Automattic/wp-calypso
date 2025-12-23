import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import {
	createList,
	deleteList,
	editList,
	editListItems,
	exportList,
	listListing,
} from './controller';

export default function () {
	page(
		'/reader/list/:user/:list/edit/items',
		sidebar,
		setBeforePrimary,
		editListItems,
		makeLayout,
		clientRender
	);
	page(
		'/reader/list/:user/:list/edit',
		sidebar,
		setBeforePrimary,
		editList,
		makeLayout,
		clientRender
	);

	page( '/reader/list/new', sidebar, setBeforePrimary, createList, makeLayout, clientRender );

	page(
		'/reader/list/:user/:list/export',
		sidebar,
		setBeforePrimary,
		exportList,
		makeLayout,
		clientRender
	);

	page(
		'/reader/list/:user/:list/delete',
		sidebar,
		setBeforePrimary,
		deleteList,
		makeLayout,
		clientRender
	);

	page(
		'/reader/list/:user/:list',
		sidebar,
		setBeforePrimary,
		listListing,
		makeLayout,
		clientRender
	);
}
