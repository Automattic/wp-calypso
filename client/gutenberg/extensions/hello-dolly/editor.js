/** @format */

/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';

registerBlockType( 'a8c/hello-dolly', {
	title: 'Hello Dolly',
	icon: 'format-audio',
	category: 'layout',
	edit: ( { isSelected } ) => (
		<p className="hello-dolly">{ isSelected ? 'Editing Hello Dolly' : 'Viewing Hello Dolly' }</p>
	),
	save: () => <p className="hello-dolly">Saving Hello Dolly</p>,
} );
