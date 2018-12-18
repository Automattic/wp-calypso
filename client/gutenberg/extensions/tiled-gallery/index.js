/**
 * External dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { filter } from 'lodash';
import { Rect, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './edit';
import save from './save';
import { DEFAULT_COLUMNS, DEFAULT_LAYOUT, LAYOUT_STYLES, LAYOUTS } from './constants';

/**
 * Style dependencies
 */
import './editor.scss';

const blockAttributes = {
	columns: {
		default: DEFAULT_COLUMNS,
		type: 'number',
	},
	ids: {
		default: [],
		type: 'array',
	},
	images: {
		type: 'array',
		default: [],
		source: 'query',
		selector: '.tiled-gallery__item',
		query: {
			alt: {
				attribute: 'alt',
				default: '',
				selector: 'img',
				source: 'attribute',
			},
			caption: {
				selector: 'figcaption',
				source: 'html',
				type: 'string',
			},
			id: {
				attribute: 'data-id',
				selector: 'img',
				source: 'attribute',
			},
			link: {
				attribute: 'data-link',
				selector: 'img',
				source: 'attribute',
			},
			url: {
				attribute: 'src',
				selector: 'img',
				source: 'attribute',
			},
		},
	},
	imageCrop: {
		default: true,
		type: 'boolean',
	},
	linkTo: {
		default: 'none',
		type: 'string',
	},
};

export const name = 'tiled-gallery';

export const settings = {
	attributes: blockAttributes,
	category: 'jetpack',
	description: __( 'Display multiple images in an elegantly organized tiled layout.' ),
	icon: (
		<SVG viewBox="0 0 20 20">
			<Rect x="8" y="11" width="9" height="6" />
			<Rect x="3" y="11" width="4" height="6" />
			<Rect x="13" y="7" width="4" height="3" />
			<Rect x="13" y="3" width="4" height="3" />
			<Rect x="3" y="3" width="9" height="7" />
		</SVG>
	),
	keywords: [
		_x( 'images', 'block search term' ),
		_x( 'photos', 'block search term' ),
		_x( 'masonry', 'block search term' ),
	],
	styles: LAYOUT_STYLES,
	supports: {
		align: true,
		alignWide: true,
		html: false,
	},
	title: __( 'Tiled gallery' ),
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/gallery' ],
				transform: attributes => {
					const validImages = filter( attributes.images, ( { id, url } ) => id && url );
					if ( validImages.length > 0 ) {
						return createBlock( name, {
							images: validImages.map( ( { id, url, alt, caption } ) => ( {
								id,
								url,
								alt,
								caption,
							} ) ),
						} );
					}
					return createBlock( name );
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
						shortcode: ( { named: { columns = 3 } } ) => {
							if ( ! columns ) {
								return;
							}

							const result = parseInt( columns, 10 );
							if ( result ) {
								return result;
							}
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
