/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discover } from './controller';
import {
	initAbTests,
	makeLayout,
	preloadReaderBundle,
	sidebar,
	updateLastRoute,
} from 'reader/controller';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';
import { READER_DISCOVER_DEFINITION } from 'reader';

export default function() {
	page(
		'/discover',
		preloadReaderBundle,
		updateLastRoute,
		initAbTests,
		sidebar,
		setSection( READER_DISCOVER_DEFINITION ),
		discover,
		makeLayout,
		clientRender
	);
}
