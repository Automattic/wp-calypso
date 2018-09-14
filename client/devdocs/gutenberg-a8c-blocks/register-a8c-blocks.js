/**
 * WordPress dependencies
 */
import '@wordpress/core-data';
import {
	registerBlockType,
	setDefaultBlockName,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import * as markdown from 'gutenberg/extensions/markdown/editor';

export const registerAutomatticBlocks = () => {
	[
		markdown,
	].forEach( ( { name, settings } ) => {
		registerBlockType( name, settings );
	} );

	setDefaultBlockName( markdown.name );
};
