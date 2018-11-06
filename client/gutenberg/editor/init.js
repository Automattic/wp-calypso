/** @format */

/**
 * External dependencies
 */
import { use, plugins, dispatch } from '@wordpress/data';
import { once } from 'lodash';

/**
 * Internal dependencies
 */
import { applyAPIMiddleware } from './api-middleware';
import { isEnabled } from 'config';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

// List of Core blocks that can't be enabled on WP.com (e.g for security reasons).
// We'll have to provide A8C custom versions of these blocks.
const WPCOM_UNSUPPORTED_CORE_BLOCKS = [
	'core/file', // see D19851 for more details.
];

const loadA8CExtensions = () => {
	require( '../extensions/classic-block/editor' );

	if ( isEnabled( 'gutenberg/block/jetpack-preset' ) ) {
		require( 'gutenberg/extensions/presets/jetpack/editor.js' );
	}
};

// We need to ensure that his function is executed only once to avoid duplicate
// block registration, API middleware application etc.
export const initGutenberg = once( ( userId, siteSlug ) => {
	debug( 'Starting Gutenberg editor initialization...' );

	debug( 'Registering data plugins' );
	const storageKey = 'WP_DATA_USER_' + userId;
	use( plugins.persistence, { storageKey: storageKey } );
	use( plugins.controls );

	// We need to ensure that core-data is loaded after the data plugins have been registered.
	debug( 'Initializing core-data store' );
	require( '@wordpress/core-data' );

	// Avoid using top level imports for this since they will statically
	// initialize core-data before required plugins are loaded.
	const { registerCoreBlocks } = require( '@wordpress/block-library' );
	const { unregisterBlockType, setFreeformContentHandlerName } = require( '@wordpress/blocks' );

	debug( 'Registering core blocks' );
	registerCoreBlocks();

	debug( 'Removing core blocks that are not yet supported in Calypso' );
	WPCOM_UNSUPPORTED_CORE_BLOCKS.forEach( blockName => unregisterBlockType( blockName ) );

	// Needed for list block indent/outdent functionality
	debug( 'Loading required TinyMCE plugins' );
	require( 'tinymce/plugins/lists/plugin.js' );

	// Prevent Guided tour from showing when editor loads.
	dispatch( 'core/nux' ).disableTips();

	debug( 'Applying API middleware' );
	applyAPIMiddleware( siteSlug );

	debug( 'Loading A8C editor extensions' );
	loadA8CExtensions();

	debug( 'Registering Calypso Classic Block handler' );
	setFreeformContentHandlerName( 'a8c/classic' );

	debug( 'Gutenberg editor initialization complete.' );

	return require( 'gutenberg/editor/main' ).default;
} );
