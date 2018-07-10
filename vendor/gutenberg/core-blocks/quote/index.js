/**
 * External dependencies
 */
import { castArray, get, isString, isEmpty, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { createBlock, getPhrasingContentSchema } from '@wordpress/blocks';
import {
	BlockControls,
	AlignmentToolbar,
	RichText,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import './theme.scss';

const toRichTextValue = ( value ) => value.map( ( ( subValue ) => subValue.children ) );
const fromRichTextValue = ( value ) => value.map( ( subValue ) => ( {
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
		default: [],
	},
	citation: {
		type: 'array',
		source: 'children',
		selector: 'cite',
	},
	align: {
		type: 'string',
	},
};

export const name = 'core/quote';

export const settings = {
	title: __( 'Quote' ),
	description: __( 'Maybe someone else said it better -- add some quoted text.' ),
	icon: 'format-quote',
	category: 'common',

	attributes: blockAttributes,

	styles: [
		{ name: 'default', label: __( 'Regular' ), isDefault: true },
		{ name: 'large', label: __( 'Large' ) },
	],

	transforms: {
		from: [
			{
				type: 'block',
				isMultiBlock: true,
				blocks: [ 'core/paragraph' ],
				transform: ( attributes ) => {
					const items = attributes.map( ( { content } ) => content );
					const hasItems = ! items.every( isEmpty );
					return createBlock( 'core/quote', {
						value: hasItems ?
							items.map( ( content, index ) => ( { children: <p key={ index }>{ content }</p> } ) ) :
							[],
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/heading' ],
				transform: ( { content } ) => {
					return createBlock( 'core/quote', {
						value: [
							{ children: <p key="1">{ content }</p> },
						],
					} );
				},
			},
			{
				type: 'pattern',
				regExp: /^>\s/,
				transform: ( { content } ) => {
					return createBlock( 'core/quote', {
						value: [
							{ children: <p key="1">{ content }</p> },
						],
					} );
				},
			},
			{
				type: 'raw',
				selector: 'blockquote',
				schema: {
					blockquote: {
						children: {
							p: {
								children: getPhrasingContentSchema(),
							},
						},
					},
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { value, citation } ) => {
					// transforming an empty quote
					if ( ( ! value || ! value.length ) && ! citation ) {
						return createBlock( 'core/paragraph' );
					}
					// transforming a quote with content
					return ( value || [] ).map( ( item ) => createBlock( 'core/paragraph', {
						content: [ get( item, [ 'children', 'props', 'children' ], '' ) ],
					} ) ).concat( citation ? createBlock( 'core/paragraph', {
						content: citation,
					} ) : [] );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/heading' ],
				transform: ( { value, citation, ...attrs } ) => {
					// if no text content exist just transform the quote into an heading block
					// using citation as the content, it may be empty creating an empty heading block.
					if ( ( ! value || ! value.length ) ) {
						return createBlock( 'core/heading', {
							content: citation,
						} );
					}

					const firstValue = get( value, [ 0, 'children' ] );
					const headingContent = castArray( isString( firstValue ) ?
						firstValue :
						get( firstValue, [ 'props', 'children' ], '' )
					);

					// if the quote content just contains a paragraph and no citation exist
					// convert the quote content into and heading block.
					if ( ! citation && value.length === 1 ) {
						return createBlock( 'core/heading', {
							content: headingContent,
						} );
					}

					// In the normal case convert the first paragraph of quote into an heading
					// and create a new quote block equal tl what we had excluding the first paragraph
					const heading = createBlock( 'core/heading', {
						content: headingContent,
					} );

					const quote = createBlock( 'core/quote', {
						...attrs,
						citation,
						value: value.slice( 1 ),
					} );

					return [ heading, quote ];
				},
			},
		],
	},

	edit( { attributes, setAttributes, isSelected, mergeBlocks, onReplace, className } ) {
		const { align, value, citation } = attributes;

		return (
			<Fragment>
				<BlockControls>
					<AlignmentToolbar
						value={ align }
						onChange={ ( nextAlign ) => {
							setAttributes( { align: nextAlign } );
						} }
					/>
				</BlockControls>
				<blockquote className={ className } style={ { textAlign: align } }>
					<RichText
						multiline="p"
						value={ toRichTextValue( value ) }
						onChange={
							( nextValue ) => setAttributes( {
								value: fromRichTextValue( nextValue ),
							} )
						}
						onMerge={ mergeBlocks }
						onRemove={ ( forward ) => {
							const hasEmptyCitation = ! citation || citation.length === 0;
							if ( ! forward && hasEmptyCitation ) {
								onReplace( [] );
							}
						} }
						/* translators: the text of the quotation */
						placeholder={ __( 'Write quote…' ) }
					/>
					{ ( ( citation && citation.length > 0 ) || isSelected ) && (
						<RichText
							tagName="cite"
							value={ citation }
							onChange={
								( nextCitation ) => setAttributes( {
									citation: nextCitation,
								} )
							}
							/* translators: the individual or entity quoted */
							placeholder={ __( 'Write citation…' ) }
						/>
					) }
				</blockquote>
			</Fragment>
		);
	},

	save( { attributes } ) {
		const { align, value, citation } = attributes;

		return (
			<blockquote style={ { textAlign: align ? align : null } }>
				<RichText.Content value={ toRichTextValue( value ) } />
				{ citation && citation.length > 0 && <RichText.Content tagName="cite" value={ citation } /> }
			</blockquote>
		);
	},

	deprecated: [
		{
			attributes: {
				...blockAttributes,
				style: {
					type: 'number',
					default: 1,
				},
			},

			migrate( attributes ) {
				if ( attributes.style === 2 ) {
					return {
						...omit( attributes, [ 'style' ] ),
						className: attributes.className ? attributes.className + ' is-style-large' : 'is-style-large',
					};
				}

				return attributes;
			},

			save( { attributes } ) {
				const { align, value, citation, style } = attributes;

				return (
					<blockquote
						className={ style === 2 ? 'is-large' : '' }
						style={ { textAlign: align ? align : null } }
					>
						<RichText.Content value={ toRichTextValue( value ) } />
						{ citation && citation.length > 0 && <RichText.Content tagName="cite" value={ citation } /> }
					</blockquote>
				);
			},
		},
		{
			attributes: {
				...blockAttributes,
				citation: {
					type: 'array',
					source: 'children',
					selector: 'footer',
				},
				style: {
					type: 'number',
					default: 1,
				},
			},

			save( { attributes } ) {
				const { align, value, citation, style } = attributes;

				return (
					<blockquote
						className={ `blocks-quote-style-${ style }` }
						style={ { textAlign: align ? align : null } }
					>
						<RichText.Content value={ toRichTextValue( value ) } />
						{ citation && citation.length > 0 && <RichText.Content tagName="footer" value={ citation } /> }
					</blockquote>
				);
			},
		},
	],
};
