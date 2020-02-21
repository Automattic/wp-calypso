/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { conversations, conversationsA8c } from './controller';
import {
	initAbTests,
	makeLayout,
	preloadReaderBundle,
	sidebar,
	updateLastRoute,
} from 'reader/controller';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';
import { READER_CONVERSATIONS_DEFINITION } from 'reader';

export default function() {
	page(
		'/read/conversations',
		preloadReaderBundle,
		updateLastRoute,
		initAbTests,
		sidebar,
		setSection( READER_CONVERSATIONS_DEFINITION ),
		conversations,
		makeLayout,
		clientRender
	);

	page(
		'/read/conversations/a8c',
		preloadReaderBundle,
		updateLastRoute,
		initAbTests,
		sidebar,
		setSection( READER_CONVERSATIONS_DEFINITION ),
		conversationsA8c,
		makeLayout,
		clientRender
	);
}
