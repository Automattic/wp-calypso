/** @format */

/**
 * External dependencies
 */

import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const settings = {
	name: 'slideshow',
	prefix: 'jetpack',
	title: __( 'Slideshow' ),
	category: 'jetpack',
	keywords: [ __( 'image' ) ],
	description: __( 'Add an interactive slideshow.' ),
	attributes: {
		align: {
			type: 'string',
		},
		images: {
			type: 'array',
			default: [],
			source: 'query',
			selector: '.wp-block-slideshow_image_container',
			query: {
				alt: {
					source: 'attribute',
					selector: 'img',
					attribute: 'alt',
					default: '',
				},
				caption: {
					type: 'string',
					source: 'html',
					selector: 'figcaption',
				},
				height: {
					source: 'attribute',
					selector: 'img',
					attribute: 'data-height',
				},
				id: {
					source: 'attribute',
					selector: 'img',
					attribute: 'data-id',
				},
				url: {
					source: 'attribute',
					selector: 'img',
					attribute: 'src',
				},
				width: {
					source: 'attribute',
					selector: 'img',
					attribute: 'data-width',
				},
			},
		},
		effect: {
			type: 'string',
			default: 'slide',
		},
	},
	effectOptions: [
		{ label: __( 'Slide' ), value: 'slide' },
		{ label: __( 'Fade' ), value: 'fade' },
		{ label: __( 'Cover Flow' ), value: 'coverflow' },
		{ label: __( 'Flip' ), value: 'flip' },
	],
	validAlignments: [ 'center', 'wide', 'full' ],
};
