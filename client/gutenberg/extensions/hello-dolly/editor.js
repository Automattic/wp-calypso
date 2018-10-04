/** @format */

/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

registerBlockType( 'calypsoberg/hello-dolly', {
	title: 'Hello Dolly',
	icon: 'format-audio',
	category: 'layout',
	edit: ( { isSelected } ) => <p>{ isSelected ? 'Editing Hello Dolly' : 'Viewing Hello Dolly' }</p>,
	save: () => <p>Saving Hello Dolly</p>,
} );
