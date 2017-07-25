/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { recommendedTags, tagListing } from './controller';
import { initAbTests, preloadReaderBundle, unmountSidebar, updateLastRoute } from 'reader/controller';

export default function() {
	page( '/tag/*', preloadReaderBundle, initAbTests );
	page( '/tag/:tag', updateLastRoute, unmountSidebar, tagListing );

	page( '/tags', initAbTests, updateLastRoute, unmountSidebar, recommendedTags );
}
