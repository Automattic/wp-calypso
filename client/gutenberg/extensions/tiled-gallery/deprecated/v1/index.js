/**
 * Internal dependencies
 */
export { default as save } from './save';
import { LAYOUT_DEFAULT } from './constants';

export const attributes = {
	// Set default align
	align: {
		default: 'center',
		type: 'string',
	},
	// Set default className (used with block styles)
	className: {
		default: `is-style-${ LAYOUT_DEFAULT }`,
		type: 'string',
	},
	columns: {
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
			height: {
				attribute: 'data-height',
				selector: 'img',
				source: 'attribute',
				type: 'number',
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
				attribute: 'data-url',
				selector: 'img',
				source: 'attribute',
			},
			width: {
				attribute: 'data-width',
				selector: 'img',
				source: 'attribute',
				type: 'number',
			},
		},
	},
	linkTo: {
		default: 'none',
		type: 'string',
	},
};

export const support = {
	align: [ 'center', 'wide', 'full' ],
	customClassName: false,
	html: false,
};
