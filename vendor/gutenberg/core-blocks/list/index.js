/**
 * External dependencies
 */
import { find, compact, get, initial, last, isEmpty, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	createBlock,
	getPhrasingContentSchema,
	getBlockAttributes,
	getBlockType,
} from '@wordpress/blocks';
import {
	BlockControls,
	RichText,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

const listContentSchema = {
	...getPhrasingContentSchema(),
	ul: {},
	ol: { attributes: [ 'type' ] },
};

// Recursion is needed.
// Possible: ul > li > ul.
// Impossible: ul > ul.
[ 'ul', 'ol' ].forEach( ( tag ) => {
	listContentSchema[ tag ].children = {
		li: {
			children: listContentSchema,
		},
	};
} );

const supports = {
	className: false,
};

const schema = {
	ordered: {
		type: 'boolean',
		default: false,
	},
	values: {
		type: 'array',
		source: 'children',
		selector: 'ol,ul',
		default: [],
	},
};

export const name = 'core/list';

export const settings = {
	title: __( 'List' ),
	description: __( 'Numbers, bullets, up to you. Add a list of items.' ),
	icon: 'editor-ul',
	category: 'common',
	keywords: [ __( 'bullet list' ), __( 'ordered list' ), __( 'numbered list' ) ],

	attributes: schema,

	supports,

	transforms: {
		from: [
			{
				type: 'block',
				isMultiBlock: true,
				blocks: [ 'core/paragraph' ],
				transform: ( blockAttributes ) => {
					const items = blockAttributes.map( ( { content } ) => content );
					const hasItems = ! items.every( isEmpty );
					return createBlock( 'core/list', {
						values: hasItems ? items.map( ( content, index ) => <li key={ index }>{ content }</li> ) : [],
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/quote' ],
				transform: ( { value, citation } ) => {
					const items = value.map( ( p ) => get( p, [ 'children', 'props', 'children' ] ) );
					if ( ! isEmpty( citation ) ) {
						items.push( citation );
					}
					const hasItems = ! items.every( isEmpty );
					return createBlock( 'core/list', {
						values: hasItems ? items.map( ( content, index ) => <li key={ index }>{ content }</li> ) : [],
					} );
				},
			},
			{
				type: 'raw',
				selector: 'ol,ul',
				schema: {
					ol: listContentSchema.ol,
					ul: listContentSchema.ul,
				},
				transform( node ) {
					return createBlock( 'core/list', {
						...getBlockAttributes(
							getBlockType( 'core/list' ),
							node.outerHTML
						),
						ordered: node.nodeName === 'OL',
					} );
				},
			},
			{
				type: 'pattern',
				regExp: /^[*-]\s/,
				transform: ( { content } ) => {
					return createBlock( 'core/list', {
						values: [ <li key="1">{ content }</li> ],
					} );
				},
			},
			{
				type: 'pattern',
				regExp: /^1[.)]\s/,
				transform: ( { content } ) => {
					return createBlock( 'core/list', {
						ordered: true,
						values: [ <li key="1">{ content }</li> ],
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { values } ) =>
					compact( values.map( ( value ) => get( value, [ 'props', 'children' ], null ) ) )
						.map( ( content ) => createBlock( 'core/paragraph', {
							content: [ content ],
						} ) ),
			},
			{
				type: 'block',
				blocks: [ 'core/quote' ],
				transform: ( { values } ) => {
					return createBlock( 'core/quote', {
						value: compact( ( values.length === 1 ? values : initial( values ) )
							.map( ( value ) => get( value, [ 'props', 'children' ], null ) ) )
							.map( ( children ) => ( { children: <p>{ children }</p> } ) ),
						citation: ( values.length === 1 ? undefined : [ get( last( values ), [ 'props', 'children' ] ) ] ),
					} );
				},
			},
		],
	},

	deprecated: [
		{
			supports,
			attributes: {
				...omit( schema, [ 'ordered' ] ),
				nodeName: {
					type: 'string',
					source: 'property',
					selector: 'ol,ul',
					property: 'nodeName',
					default: 'UL',
				},
			},
			migrate( attributes ) {
				const { nodeName, ...migratedAttributes } = attributes;

				return {
					...migratedAttributes,
					ordered: 'OL' === nodeName,
				};
			},
			save( { attributes } ) {
				const { nodeName, values } = attributes;

				return (
					<RichText.Content
						tagName={ nodeName.toLowerCase() }
						value={ values }
					/>
				);
			},
		},
	],

	merge( attributes, attributesToMerge ) {
		const valuesToMerge = attributesToMerge.values || [];

		// Standard text-like block attribute.
		if ( attributesToMerge.content ) {
			valuesToMerge.push( attributesToMerge.content );
		}

		return {
			...attributes,
			values: [
				...attributes.values,
				...valuesToMerge,
			],
		};
	},

	edit: class extends Component {
		constructor() {
			super( ...arguments );

			this.setupEditor = this.setupEditor.bind( this );
			this.getEditorSettings = this.getEditorSettings.bind( this );
			this.setNextValues = this.setNextValues.bind( this );

			this.state = {
				internalListType: null,
			};
		}

		findInternalListType( { parents } ) {
			const list = find( parents, ( node ) => node.nodeName === 'UL' || node.nodeName === 'OL' );
			return list ? list.nodeName : null;
		}

		setupEditor( editor ) {
			editor.on( 'nodeChange', ( nodeInfo ) => {
				this.setState( {
					internalListType: this.findInternalListType( nodeInfo ),
				} );
			} );

			// this checks for languages that do not typically have square brackets on their keyboards
			const lang = window.navigator.browserLanguage || window.navigator.language;
			const keyboardHasSqBracket = ! /^(?:fr|nl|sv|ru|de|es|it)/.test( lang );

			if ( keyboardHasSqBracket ) {
				// keycode 219 = '[' and keycode 221 = ']'
				editor.shortcuts.add( 'meta+219', 'Decrease indent', 'Outdent' );
				editor.shortcuts.add( 'meta+221', 'Increase indent', 'Indent' );
			} else {
				editor.shortcuts.add( 'meta+shift+m', 'Decrease indent', 'Outdent' );
				editor.shortcuts.add( 'meta+m', 'Increase indent', 'Indent' );
			}

			this.editor = editor;
		}

		createSetListType( type, command ) {
			return () => {
				const { setAttributes } = this.props;
				const { internalListType } = this.state;
				if ( internalListType ) {
					// only change list types, don't toggle off internal lists
					if ( internalListType !== type && this.editor ) {
						this.editor.execCommand( command );
					}
				} else {
					setAttributes( { ordered: type === 'OL' } );
				}
			};
		}

		createExecCommand( command ) {
			return () => {
				if ( this.editor ) {
					this.editor.execCommand( command );
				}
			};
		}

		getEditorSettings( editorSettings ) {
			return {
				...editorSettings,
				plugins: ( editorSettings.plugins || [] ).concat( 'lists' ),
				lists_indent_on_tab: false,
			};
		}

		setNextValues( nextValues ) {
			this.props.setAttributes( { values: nextValues } );
		}

		render() {
			const {
				attributes,
				insertBlocksAfter,
				setAttributes,
				mergeBlocks,
				onReplace,
				className,
			} = this.props;
			const { ordered, values } = attributes;
			const tagName = ordered ? 'ol' : 'ul';

			return (
				<Fragment>
					<BlockControls
						controls={ [
							{
								icon: 'editor-ul',
								title: __( 'Convert to unordered list' ),
								isActive: ! ordered,
								onClick: this.createSetListType( 'UL', 'InsertUnorderedList' ),
							},
							{
								icon: 'editor-ol',
								title: __( 'Convert to ordered list' ),
								isActive: ordered,
								onClick: this.createSetListType( 'OL', 'InsertOrderedList' ),
							},
							{
								icon: 'editor-outdent',
								title: __( 'Outdent list item' ),
								onClick: this.createExecCommand( 'Outdent' ),
							},
							{
								icon: 'editor-indent',
								title: __( 'Indent list item' ),
								onClick: this.createExecCommand( 'Indent' ),
							},
						] }
					/>
					<RichText
						multiline="li"
						tagName={ tagName }
						getSettings={ this.getEditorSettings }
						onSetup={ this.setupEditor }
						onChange={ this.setNextValues }
						value={ values }
						wrapperClassName="core-blocks-list"
						className={ className }
						placeholder={ __( 'Write list…' ) }
						onMerge={ mergeBlocks }
						onSplit={
							insertBlocksAfter ?
								( before, after, ...blocks ) => {
									if ( ! blocks.length ) {
										blocks.push( createBlock( 'core/paragraph' ) );
									}

									if ( after.length ) {
										blocks.push( createBlock( 'core/list', {
											ordered,
											values: after,
										} ) );
									}

									setAttributes( { values: before } );
									insertBlocksAfter( blocks );
								} :
								undefined
						}
						onRemove={ () => onReplace( [] ) }
					/>
				</Fragment>
			);
		}
	},

	save( { attributes } ) {
		const { ordered, values } = attributes;
		const tagName = ordered ? 'ol' : 'ul';

		return (
			<RichText.Content tagName={ tagName } value={ values } />
		);
	},
};
