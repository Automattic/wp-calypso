import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { search } from './controller';

export default function () {
	// Old recommendations page
	page( '/recommendations', '/read/search' );

	page( '/read/search', updateLastRoute, sidebar, search, makeLayout, clientRender );
}
