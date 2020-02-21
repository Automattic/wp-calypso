/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { search } from './controller';
import { makeLayout, preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';
import { READER_SEARCH_DEFINITION } from 'reader';

export default function() {
	page(
		'/read/search',
		preloadReaderBundle,
		updateLastRoute,
		sidebar,
		setSection( READER_SEARCH_DEFINITION ),
		search,
		makeLayout,
		clientRender
	);
}
