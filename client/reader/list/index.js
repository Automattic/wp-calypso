/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { listListing } from './controller';
import { sidebar, updateLastRoute } from 'client/reader/controller';
import { makeLayout, render as clientRender } from 'client/controller';

export default function() {
	page( '/read/list/:user/:list', updateLastRoute, sidebar, listListing, makeLayout, clientRender );
}
