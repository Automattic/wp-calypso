/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { listListing } from './controller';
import { makeLayout, sidebar, updateLastRoute } from 'reader/controller';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';
import { READER_LIST_DEFINITION } from 'reader';

export default function() {
	page(
		'/read/list/:user/:list',
		updateLastRoute,
		sidebar,
		setSection( READER_LIST_DEFINITION ),
		listListing,
		makeLayout,
		clientRender
	);
}
