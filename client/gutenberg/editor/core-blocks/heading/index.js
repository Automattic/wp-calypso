/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	createBlock,
	getPhrasingContentSchema,
	getBlockAttributes,
	getBlockType,
	children,
} from '@wordpress/blocks';
import { RichText } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import edit from './edit';

/**
 * Given a node name string for a heading node, returns its numeric level.
 *
 * @param {string} nodeName Heading node name.
 *
 * @return {number} Heading level.
 */
export function getLevelFromHeadingNodeName( nodeName ) {
	return Number( nodeName.substr( 1 ) );
}

const supports = {
	className: false,
	anchor: true,
};

const schema = {
	content: {
		type: 'array',
		source: 'children',
		selector: 'h1,h2,h3,h4,h5,h6',
	},
	level: {
		type: 'number',
		default: 2,
	},
	align: {
		type: 'string',
	},
	placeholder: {
		type: 'string',
	},
};

export const name = 'core/heading';

export const settings = {
	title: __( 'Heading' ),

	description: __( 'Insert a headline above your post or page content.' ),

	icon: 'heading',

	category: 'common',

	keywords: [ __( 'title' ), __( 'subtitle' ) ],

	supports,

	attributes: schema,

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { content } ) => {
					return createBlock( 'core/heading', {
						content,
					} );
				},
			},
			{
				type: 'raw',
				selector: 'h1,h2,h3,h4,h5,h6',
				schema: {
					h1: { children: getPhrasingContentSchema() },
					h2: { children: getPhrasingContentSchema() },
					h3: { children: getPhrasingContentSchema() },
					h4: { children: getPhrasingContentSchema() },
					h5: { children: getPhrasingContentSchema() },
					h6: { children: getPhrasingContentSchema() },
				},
				transform( node ) {
					return createBlock( 'core/heading', {
						...getBlockAttributes(
							getBlockType( 'core/heading' ),
							node.outerHTML
						),
						level: getLevelFromHeadingNodeName( node.nodeName ),
					} );
				},
			},
			{
				type: 'pattern',
				regExp: /^(#{2,6})\s/,
				transform: ( { content, match } ) => {
					const level = match[ 1 ].length;

					return createBlock( 'core/heading', {
						level,
						content,
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { content } ) => {
					return createBlock( 'core/paragraph', {
						content,
					} );
				},
			},
		],
	},

	deprecated: [
		{
			supports,
			attributes: {
				...omit( schema, [ 'level' ] ),
				nodeName: {
					type: 'string',
					source: 'property',
					selector: 'h1,h2,h3,h4,h5,h6',
					property: 'nodeName',
					default: 'H2',
				},
			},
			migrate( attributes ) {
				const { nodeName, ...migratedAttributes } = attributes;

				return {
					...migratedAttributes,
					level: getLevelFromHeadingNodeName( nodeName ),
				};
			},
			save( { attributes } ) {
				const { align, nodeName, content } = attributes;

				return (
					<RichText.Content
						tagName={ nodeName.toLowerCase() }
						style={ { textAlign: align } }
						value={ content }
					/>
				);
			},
		},
	],

	merge( attributes, attributesToMerge ) {
		return {
			content: children.concat(
				attributes.content,
				attributesToMerge.content
			),
		};
	},

	edit,

	save( { attributes } ) {
		const { align, level, content } = attributes;
		const tagName = 'h' + level;

		return (
			<RichText.Content
				tagName={ tagName }
				style={ { textAlign: align } }
				value={ content }
			/>
		);
	},
};
