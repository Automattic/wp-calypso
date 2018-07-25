/** @format */
/**
 * External dependencies
 */
import wp from 'wp';

wp.blocks.registerBlockType( 'calypsoberg/hello-dolly', {
	title: 'Hello Dolly',
	icon: 'format-audio',
	category: 'layout',
	edit: ( { isSelected } ) => (
		<div className="hello-dolly__block">
			<p>{ isSelected ? 'Editing Hello Dolly' : 'Viewing Hello Dolly' }</p>
		</div>
	),
	save: () => (
		<div className="hello-dolly__block">
			<p>Saving Hello Dolly</p>
		</div>
	),
} );
