/** @format */

/**
 * External dependencies
 */
import { translate as __ } from 'i18n-calypso';
import { RichText, BlockControls, AlignmentToolbar } from '@wordpress/editor';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';

export const name = 'a8c/slider';

export const settings = {
	title: __( 'slider' ),

	description: __( 'Slider Stub' ),

	icon: 'smiley',

	category: 'formatting',

	keywords: [ __( 'slider' ) ],

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'p',
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
				transform: attributes => createBlock( 'a8c/slider', attributes ),
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: attributes => createBlock( 'core/paragraph', attributes ),
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
						onChange={ nextAlign => {
							setAttributes( { textAlign: nextAlign } );
						} }
					/>
				</BlockControls>
				<RichText
					tagName="p"
					value={ content }
					onChange={ nextContent => {
						setAttributes( {
							content: nextContent,
						} );
					} }
					style={ { textAlign: textAlign } }
					placeholder={ __( 'Write…' ) }
					wrapperClassName={ className }
				/>
			</Fragment>
		);
	},

	save( { attributes, className } ) {
		const { textAlign, content } = attributes;

		return (
			<RichText.Content
				tagName="p"
				className={ className }
				style={ { textAlign: textAlign } }
				value={ content }
			/>
		);
	},
};

registerBlockType( name, settings );
