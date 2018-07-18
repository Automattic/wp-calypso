/** @format */
/**
 * External dependencies
 */
import wp from 'wp';

wp.blocks.registerBlockType( 'calypsoberg/hello-dolly', {
	title: 'Hello Dolly',
	icon: 'format-audio',
	category: 'layout',
	edit: ( { isSelected } ) => <p>{ isSelected ? 'Editing Hello Dolly' : 'Viewing Hello Dolly' }</p>,
	save: () => <p>Saving Hello Dolly</p>,
} );
