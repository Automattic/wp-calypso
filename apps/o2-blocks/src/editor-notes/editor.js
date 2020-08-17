/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { RichText } from '@wordpress/editor';

import './editor.scss';

const attributes = {
	notes: {
		type: 'array',
	},
};

const edit = ( { attributes: { notes }, className, isSelected, setAttributes } ) => (
	<div className={ isSelected ? 'is-selected' : '' }>
		{ ! isSelected && (
			<span className="editor-notes__editor-indicator">
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
			onChange={ ( newNotes ) => setAttributes( { notes: newNotes } ) }
		/>
	</div>
);

const save = () => null;

registerBlockType( 'a8c/editor-notes', {
	title: "Editor's Notes",
	icon: 'welcome-write-blog',
	category: 'a8c',
	attributes,
	edit,
	save,
} );
