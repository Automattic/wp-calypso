/**
 * External dependencies
 */
import { getBlockType, unregisterBlockType } from '@wordpress/blocks';
import domReady from '@wordpress/dom-ready';

const experimentalBlocks = [
	'core/legacy-widget',
	'core/navigation-menu',
	'core/navigation-menu-item',
];

domReady( function() {
	experimentalBlocks.forEach( blockName => {
		const block = getBlockType( blockName );
		if ( block ) {
			unregisterBlockType( blockName );
		}
	} );
} );
