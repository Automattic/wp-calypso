/** @format */

/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';

registerBlockType( 'calypsoberg/hello-dolly', {
	title: 'Hello Dolly',
	icon: 'format-audio',
	category: 'layout',
	edit: ( { isSelected } ) => (
		<p class="hello-dolly">{ isSelected ? 'Editing Hello Dolly' : 'Viewing Hello Dolly' }</p>
	),
	save: () => <p class="hello-dolly">Saving Hello Dolly</p>,
} );
