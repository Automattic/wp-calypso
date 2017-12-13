/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { tagListing } from './controller';
import { initAbTests, preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/tag/*', preloadReaderBundle, initAbTests, makeLayout, clientRender );
	page( '/tag/:tag', updateLastRoute, sidebar, tagListing, makeLayout, clientRender );
}
