/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import debugFactory from 'debug';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import { registerCoreBlocks } from '@wordpress/block-library';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import LayoutPreview from './components/layout-preview';

// Load plugin styles.
import './style.scss';

const debug = debugFactory( 'editor-layout-preview' );
debug( 'init' );

domReady( function() {
	debug( 'on ready...' );

	const settings = window.editor_layout_preview || {};
	debug( 'settings: %o', settings );

	registerCoreBlocks();

	render( <LayoutPreview />, document.getElementById( 'editor-large-preview' ) );
} );
