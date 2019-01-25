/** @format */

/**
 * External dependencies
 */

import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

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
			selector: '.swiper-slide',
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
			},
		},
		effect: {
			type: 'string',
			default: 'slide',
		},
	},
	effectOptions: [
		{ label: _x( 'Slide', 'Slideshow transition effect' ), value: 'slide' },
		{ label: _x( 'Fade', 'Slideshow transition effect' ), value: 'fade' },
		{ label: _x( 'Cover Flow', 'Slideshow transition effect' ), value: 'coverflow' },
		{ label: _x( 'Flip', 'Slideshow transition effect' ), value: 'flip' },
	],
	validAlignments: [ 'center', 'wide', 'full' ],
	supports: {
		html: false,
	},
};
