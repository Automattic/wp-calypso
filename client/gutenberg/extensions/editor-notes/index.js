/** @format */
/**
 * External dependencies
 */
import wp from 'wp';
const { RichText } = wp.editor;

import './style.scss';

const attributes = {
	notes: {
		type: 'array',
	},
};

const edit = ( { attributes: { notes }, className, isSelected, setAttributes } ) => (
	<div style={ { paddingTop: isSelected ? '6px' : '32px' } }>
		{ ! isSelected && (
			<span style={ { position: 'absolute', top: 0, left: '8px', fontStyle: 'italic' } }>
				<span role="img" aria-label="notebook">
					📔
				</span>
				Editor's Notes: hidden from rendered page
			</span>
		) }
		<RichText
			tagName="p"
			className={ className }
			value={ notes }
			onChange={ newNotes => setAttributes( { notes: newNotes } ) }
		/>
	</div>
);

const save = () => null;

wp.blocks.registerBlockType( 'a8c/editor-notes', {
	title: "Editor's Notes",
	icon: 'welcome-write-blog',
	category: 'common',
	attributes,
	edit,
	save,
} );
