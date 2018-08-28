/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock, registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './tiled-gallery.scss';
import JetpackGalleryBlockEditor from './edit.js';
import JetpackGalleryBlockSave from './save.js';

const JetpackGalleryBlockType = 'a8c/tiled-gallery';

const settings = {
	title: __( 'Tiled Gallery' ),
	icon: 'format-gallery',
	category: 'layout',

	attributes: {
		columns: {
			type: 'integer',
			'default': 3,
		},
		linkTo: {
			type: 'string',
			'default': 'none',
		},
		images: {
			type: 'array',
			'default': [],
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
					'default': '',
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
					return createBlock( JetpackGalleryBlockType, content );
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

	edit: JetpackGalleryBlockEditor,
	save: JetpackGalleryBlockSave
};

registerBlockType(
	JetpackGalleryBlockType,
	settings
);
