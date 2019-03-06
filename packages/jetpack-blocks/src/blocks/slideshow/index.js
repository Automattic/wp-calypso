/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';
import { __ } from '../../utils/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import transforms from './transforms';

const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
	</SVG>
);

const attributes = {
	align: {
		default: 'center',
		type: 'string',
	},
	autoplay: {
		type: 'boolean',
		default: false,
	},
	delay: {
		type: 'number',
		default: 3,
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
};

export const name = 'slideshow';

export const settings = {
	title: __( 'Slideshow' ),
	category: 'jetpack',
	keywords: [ __( 'image' ), __( 'gallery' ), __( 'slider' ) ],
	description: __( 'Add an interactive slideshow.' ),
	attributes,
	supports: {
		align: [ 'center', 'wide', 'full' ],
		html: false,
	},
	icon,
	edit,
	save,
	transforms,
};
