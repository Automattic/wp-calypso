/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { likes } from './controller';
import {
	preloadReaderBundle,
	initAbTests,
	makeLayout,
	updateLastRoute,
	sidebar,
} from 'reader/controller';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';
import { READER_ACTIVITIES_DEFINITION } from 'reader';

export default function() {
	page(
		'/activities/likes',
		preloadReaderBundle,
		initAbTests,
		updateLastRoute,
		sidebar,
		setSection( READER_ACTIVITIES_DEFINITION ),
		likes,
		makeLayout,
		clientRender
	);
}
