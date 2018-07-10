/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import {
	BlockControls,
	BlockAlignmentToolbar,
	RichText,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import './theme.scss';

const toRichTextValue = ( value ) => map( value, ( ( subValue ) => subValue.children ) );
const fromRichTextValue = ( value ) => map( value, ( subValue ) => ( {
	children: subValue,
} ) );
const blockAttributes = {
	value: {
		type: 'array',
		source: 'query',
		selector: 'blockquote > p',
		query: {
			children: {
				source: 'node',
			},
		},
	},
	citation: {
		type: 'array',
		source: 'children',
		selector: 'cite',
	},
	align: {
		type: 'string',
		default: 'none',
	},
};

export const name = 'core/pullquote';

export const settings = {

	title: __( 'Pullquote' ),

	description: __( 'Highlight a quote from your post or page by displaying it as a graphic element.' ),

	icon: 'format-quote',

	category: 'formatting',

	attributes: blockAttributes,

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit( { attributes, setAttributes, isSelected, className } ) {
		const { value, citation, align } = attributes;
		const updateAlignment = ( nextAlign ) => setAttributes( { align: nextAlign } );

		return (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ updateAlignment }
					/>
				</BlockControls>
				<blockquote className={ className }>
					<RichText
						multiline="p"
						value={ toRichTextValue( value ) }
						onChange={
							( nextValue ) => setAttributes( {
								value: fromRichTextValue( nextValue ),
							} )
						}
						/* translators: the text of the quotation */
						placeholder={ __( 'Write quote…' ) }
						wrapperClassName="core-blocks-pullquote__content"
					/>
					{ ( citation || isSelected ) && (
						<RichText
							tagName="cite"
							value={ citation }
							/* translators: the individual or entity quoted */
							placeholder={ __( 'Write citation…' ) }
							onChange={
								( nextCitation ) => setAttributes( {
									citation: nextCitation,
								} )
							}
						/>
					) }
				</blockquote>
			</Fragment>
		);
	},

	save( { attributes } ) {
		const { value, citation, align } = attributes;

		return (
			<blockquote className={ `align${ align }` }>
				<RichText.Content value={ toRichTextValue( value ) } />
				{ citation && citation.length > 0 && <RichText.Content tagName="cite" value={ citation } /> }
			</blockquote>
		);
	},

	deprecated: [ {
		attributes: {
			...blockAttributes,
			citation: {
				type: 'array',
				source: 'children',
				selector: 'footer',
			},
		},

		save( { attributes } ) {
			const { value, citation, align } = attributes;

			return (
				<blockquote className={ `align${ align }` }>
					<RichText.Content value={ toRichTextValue( value ) } />
					{ citation && citation.length > 0 && <RichText.Content tagName="footer" value={ citation } /> }
				</blockquote>
			);
		},
	} ],
};
