/**
 * WordPress
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import {
	RichText,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

export const name = 'core/verse';

export const settings = {
	title: __( 'Verse' ),

	description: __( 'A block for haiku? Why not? Blocks for all the things! (See what we did here?)' ),

	icon: 'edit',

	category: 'formatting',

	keywords: [ __( 'poetry' ) ],

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'pre',
		},
		textAlign: {
			type: 'string',
		},
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( attributes ) =>
					createBlock( 'core/verse', attributes ),
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( attributes ) =>
					createBlock( 'core/paragraph', attributes ),
			},
		],
	},

	edit( { attributes, setAttributes, className } ) {
		const { textAlign, content } = attributes;

		return (
			<Fragment>
				<BlockControls>
					<AlignmentToolbar
						value={ textAlign }
						onChange={ ( nextAlign ) => {
							setAttributes( { textAlign: nextAlign } );
						} }
					/>
				</BlockControls>
				<RichText
					tagName="pre"
					value={ content }
					onChange={ ( nextContent ) => {
						setAttributes( {
							content: nextContent,
						} );
					} }
					style={ { textAlign: textAlign } }
					placeholder={ __( 'Write…' ) }
					wrapperClassName={ className }
					formattingControls={ [ 'bold', 'italic', 'strikethrough' ] }
				/>
			</Fragment>
		);
	},

	save( { attributes, className } ) {
		const { textAlign, content } = attributes;

		return (
			<RichText.Content
				tagName="pre"
				className={ className }
				style={ { textAlign: textAlign } }
				value={ content }
			/>
		);
	},
};
