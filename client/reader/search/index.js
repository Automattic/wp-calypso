/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { search } from './controller';
import { sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	// Old recommendations page
	page( '/recommendations', '/read/search' );

	page( '/read/search', updateLastRoute, sidebar, search, makeLayout, clientRender );
}
