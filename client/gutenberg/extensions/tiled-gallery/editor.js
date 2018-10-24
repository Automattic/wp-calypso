/** @format */

/**
 * External dependencies
 */
import filter from 'lodash/filter';
import { __ } from '@wordpress/i18n';
import { createBlock, registerBlockStyle, registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';
import { DEFAULT_COLUMNS, DEFAULT_LAYOUT, LAYOUT_STYLES, LAYOUTS } from './constants';
import { default as edit } from './edit';
import { default as save } from './save';

const blockAttributes = {
	images: {
		type: 'array',
		default: [],
		source: 'query',
		selector: '.wp-block-jetpack-tiled-gallery .tiled-gallery__item',
		query: {
			url: {
				source: 'attribute',
				selector: 'img',
				attribute: 'src',
			},
			link: {
				source: 'attribute',
				selector: 'img',
				attribute: 'data-link',
			},
			alt: {
				source: 'attribute',
				selector: 'img',
				attribute: 'alt',
				default: '',
			},
			id: {
				source: 'attribute',
				selector: 'img',
				attribute: 'data-id',
			},
			caption: {
				source: 'html',
				selector: 'figcaption',
			},
		},
	},
	columns: {
		type: 'number',
		default: DEFAULT_COLUMNS,
	},
	imageCrop: {
		type: 'boolean',
		default: true,
	},
	linkTo: {
		type: 'string',
		default: 'none',
	},
};

export const blockName = 'jetpack/tiled-gallery';

const blockSettings = {
	title: __( 'Tiled gallery', 'jetpack' ),
	description: __( 'Display multiple images in an elegantly organized tiled layout.', 'jetpack' ),
	icon: (
		<svg viewBox="0 0 20 20">
			<rect x="8" y="11" width="9" height="6" />
			<rect x="3" y="11" width="4" height="6" />
			<rect x="13" y="7" width="4" height="3" />
			<rect x="13" y="3" width="4" height="3" />
			<rect x="3" y="3" width="9" height="7" />
		</svg>
	),
	category: 'jetpack',
	keywords: [ __( 'images', 'jetpack' ), __( 'photos', 'jetpack' ), __( 'masonry', 'jetpack' ) ],
	attributes: blockAttributes,
	supports: {
		align: true,
	},
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/gallery' ],
				transform: attributes => {
					const validImages = filter( attributes.images, ( { id, url } ) => id && url );
					if ( validImages.length > 0 ) {
						return createBlock( blockName, {
							images: validImages.map( ( { id, url, alt, caption } ) => ( {
								id,
								url,
								alt,
								caption,
							} ) ),
						} );
					}
					return createBlock( blockName );
				},
			},
			{
				type: 'shortcode',
				tag: 'gallery',
				attributes: {
					// @TODO: other params: https://en.support.wordpress.com/gallery/#gallery-shortcode
					images: {
						type: 'array',
						shortcode: ( { named: { ids } } ) => {
							if ( ! ids ) {
								return [];
							}

							return ids.split( ',' ).map( id => ( {
								id: parseInt( id, 10 ),
							} ) );
						},
					},
					columns: {
						type: 'number',
						shortcode: ( { named: { columns = '3' } } ) => {
							return parseInt( columns, 10 );
						},
					},
					linkTo: {
						type: 'string',
						shortcode: ( { named: { link = 'attachment' } } ) => {
							return link === 'file' ? 'media' : link;
						},
					},
					layout: {
						type: 'string',
						shortcode: ( { named: { type = DEFAULT_LAYOUT } } ) => {
							// @TODO: if `type=slideshow`, return a slideshow block
							return LAYOUTS.indexOf( type ) > -1 ? type : DEFAULT_LAYOUT;
						},
					},
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/gallery' ],
				transform: ( { images, columns, imageCrop, linkTo } ) =>
					createBlock( 'core/gallery', { images, columns, imageCrop, linkTo } ),
			},
			{
				type: 'block',
				blocks: [ 'core/image' ],
				transform: ( { images } ) => {
					if ( images.length > 0 ) {
						return images.map( ( { id, url, alt, caption } ) =>
							createBlock( 'core/image', { id, url, alt, caption } )
						);
					}
					return createBlock( 'core/image' );
				},
			},
		],
	},
	edit,
	save,
};

LAYOUT_STYLES.forEach( style => {
	registerBlockStyle( blockName, style );
} );

registerBlockType( blockName, blockSettings );
