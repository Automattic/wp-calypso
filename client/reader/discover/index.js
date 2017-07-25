/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discover } from './controller';
import { initAbTests, preloadReaderBundle, unmountSidebar, updateLastRoute } from 'reader/controller';

export default function() {
	page( '/discover', preloadReaderBundle, updateLastRoute, initAbTests, unmountSidebar, discover );
}
