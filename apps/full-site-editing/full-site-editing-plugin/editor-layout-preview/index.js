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
import { parse as parseBlocks } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

// Load plugin styles.
import './style.scss';

// Load testing template.
import testingTemplate from './util/testing_template';

const debug = debugFactory( 'editor-layout-preview' );
debug( 'init' );

domReady( function() {
	debug( 'on ready...' );

	const settings = window.editor_layout_preview || {};
	debug( 'settings: %o', settings );

	registerCoreBlocks();

	debug( 'testing template: %o', testingTemplate );
	const blocks = parseBlocks( testingTemplate );
	debug( 'blocks: %o', blocks );

	render( <h1>Hi!</h1>, document.getElementById( 'editor-large-preview' ) );
} );
