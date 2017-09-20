/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { likes } from './controller';
import { preloadReaderBundle, initAbTests, updateLastRoute, unmountSidebar } from 'reader/controller';

export default function() {
	page( '/activities/likes', preloadReaderBundle, initAbTests, updateLastRoute, unmountSidebar, likes );
}
