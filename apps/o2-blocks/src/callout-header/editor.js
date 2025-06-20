/**
 * Callout Header Block
 *
 * Header component for callout blocks using RichText.
 * Restricted to use only within callout blocks.
 */

import { RichText } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

const CalloutHeaderBlock = {
	name: 'a8c/callout-header',
	settings: {
		title: __( 'Callout Header' ),
		icon: 'heading',
		category: 'a8c',
		parent: [ 'a8c/callout' ],
		supports: {
			html: false,
			className: false,
			reusable: false,
			selectable: false,
		},
		attributes: {
			content: {
				type: 'string',
				source: 'html',
				selector: 'p',
				default: '',
			},
		},
		edit: ( { attributes, setAttributes } ) => {
			const { content } = attributes;

			return (
				<RichText
					tagName="p"
					className="o2-blocks-callout__header"
					value={ content }
					onChange={ ( newContent ) => setAttributes( { content: newContent } ) }
					placeholder={ __( 'Header' ) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
				/>
			);
		},
		save: ( { attributes } ) => {
			const { content } = attributes;

			return (
				<RichText.Content tagName="p" className="o2-blocks-callout__header" value={ content } />
			);
		},
	},
};

registerBlockType( CalloutHeaderBlock.name, CalloutHeaderBlock.settings );
