/** @format */

/**
 * External dependencies
 */
import { use, plugins, dispatch } from '@wordpress/data';
import { once } from 'lodash';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

// List of Core blocks that can't be enabled on WP.com (e.g for security reasons).
// We'll have to provide A8C custom versions of these blocks.
const WPCOM_UNSUPPORTED_CORE_BLOCKS = [
	'core/file', // see D19851 for more details.
];

// We need to ensure that his function is executed only once to avoid
// registering core blocks and applying middleware twice.
export const initGutenberg = once( userId => {
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
	const blockLibrary = require( '@wordpress/block-library' );
	const blocks = require( '@wordpress/blocks' );

	debug( 'Registering core blocks' );
	blockLibrary.registerCoreBlocks();

	debug( 'Removing core blocks that are not yet supported in Calypso' );
	WPCOM_UNSUPPORTED_CORE_BLOCKS.forEach( blockName => blocks.unregisterBlockType( blockName ) );

	debug( 'Registering Calypso Classic Block handler' );
	require( '../extensions/classic-block/editor' );
	blocks.setFreeformContentHandlerName( 'a8c/classic' );

	// Needed for list block indent/outdent functionality
	debug( 'Loading required TinyMCE plugins' );
	require( 'tinymce/plugins/lists/plugin.js' );

	// Prevent Guided tour from showing when editor loads.
	dispatch( 'core/nux' ).disableTips();

	debug( 'Gutenberg editor initialization complete.' );

	return require( 'gutenberg/editor/main' ).default;
} );
