/** @format */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock, registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import TiledGalleryEdit from './edit.jsx';
import TiledGallerySave from './save.jsx';

const blockType = 'jetpack/tiled-gallery';

const blockSettings = {
	title: __( 'Tiled Gallery', 'jetpack' ),
	description: __( 'Display multiple images in an elegantly organized tiled layout.', 'jetpack' ),
	icon: 'format-gallery',
	category: 'jetpack',
	keywords: [ __( 'images', 'jetpack' ), __( 'photos', 'jetpack' ) ],
	attributes: {
		columns: {
			type: 'integer',
			default: 3,
		},
		linkTo: {
			type: 'string',
			default: 'none',
		},
		images: {
			type: 'array',
			default: [],
			source: 'query',
			selector: '.tiled-gallery-item',
			query: {
				width: {
					source: 'attribute',
					selector: 'img',
					attribute: 'data-original-width',
				},
				height: {
					source: 'attribute',
					selector: 'img',
					attribute: 'data-original-height',
				},
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
					type: 'array',
					source: 'children',
					selector: 'figcaption',
				},
			},
		},
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/gallery' ],
				transform: function( content ) {
					return createBlock( blockType, content );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/gallery' ],
				transform: function( content ) {
					return createBlock( 'core/gallery', content );
				},
			},
		],
	},
	edit: TiledGalleryEdit,
	save: TiledGallerySave,
};

registerBlockType( blockType, blockSettings );
