/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { isEnabled } from '../../config';
import type { Design } from './stores/onboard/types';

const availableDesigns: Readonly< AvailableDesigns > = {
	featured: [
		{
			title: 'Cassel',
			slug: 'cassel',
			template: 'cassel',
			theme: 'mayland',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/mayland/cassel/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'blog' ],
			is_premium: false,
		},
		{
			title: 'Edison',
			slug: 'edison',
			template: 'edison',
			theme: 'stratford',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/stratford/edison/',
			fonts: {
				headings: 'Chivo',
				base: 'Open Sans',
			},
			categories: [ 'featured', 'blog' ],
			is_premium: true,
		},
		{
			title: 'Vesta',
			slug: 'vesta',
			template: 'vesta',
			theme: 'mayland',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/mayland/vesta/',
			fonts: {
				headings: 'Cabin',
				base: 'Raleway',
			},
			categories: [ 'featured', 'portfolio' ],
			is_premium: false,
		},
		{
			title: 'Doyle',
			slug: 'doyle',
			template: 'doyle',
			theme: 'alves',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/alves/doyle/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'business' ],
			is_premium: true,
		},
		{
			title: 'Bowen',
			slug: 'bowen',
			template: 'bowen',
			theme: 'coutoire',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/coutoire/bowen/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'blog' ],
			is_premium: false,
		},
		{
			title: 'Easley',
			slug: 'easley',
			template: 'easley',
			theme: 'maywood',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/maywood/easley/',
			fonts: {
				headings: 'Space Mono',
				base: 'Roboto',
			},
			categories: [ 'featured', 'portfolio' ],
			is_premium: false,
		},
		{
			title: 'Camdem',
			slug: 'Camdem',
			template: 'camdem',
			theme: 'maywood',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/maywood/camdem/',
			fonts: {
				headings: 'Space Mono',
				base: 'Roboto',
			},
			categories: [ 'featured', 'portfolio' ],
			is_premium: false,
		},
		{
			title: 'Reynolds',
			slug: 'reynolds',
			template: 'reynolds',
			theme: 'rockfield',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/rockfield/reynolds/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'portfolio' ],
			is_premium: false,
		},
		{
			title: 'Overton',
			slug: 'overton',
			template: 'overton',
			theme: 'alves',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/alves/overton/',
			fonts: {
				headings: 'Cabin',
				base: 'Raleway',
			},
			categories: [ 'featured', 'business' ],
			is_premium: false,
		},
		{
			title: 'Brice',
			slug: 'brice',
			template: 'brice',
			theme: 'mayland',
			src: 'https://public-api.wordpress.com/rest/v1/template/demo/mayland/brice/',
			fonts: {
				headings: 'Playfair Display',
				base: 'Fira Sans',
			},
			categories: [ 'featured', 'charity', 'non-profit' ],
			is_premium: false,
		},
	],
};

export default availableDesigns;
interface AvailableDesigns {
	featured: Design[];
}

export const getDesignImageUrl = ( design: Design ) => {
	// We temporarily show pre-generated screenshots until we can generate tall versions dynamically using mshots.
	// See `bin/generate-gutenboarding-design-thumbnails.js` for generating screenshots.
	// https://github.com/Automattic/mShots/issues/16
	// https://github.com/Automattic/wp-calypso/issues/40564
	if ( ! isEnabled( 'gutenboarding/mshot-preview' ) ) {
		return `/calypso/page-templates/design-screenshots/${ design.slug }_${ design.template }_${ design.theme }.jpg`;
	}

	const mshotsUrl = 'https://s.wordpress.com/mshots/v1/';
	const previewUrl = addQueryArgs( design.src, {
		font_headings: design.fonts.headings,
		font_base: design.fonts.base,
	} );
	return mshotsUrl + encodeURIComponent( previewUrl );
};

/**
 * Asynchronously load available design images
 */
export function prefetchDesignThumbs() {
	if ( typeof window !== 'undefined' ) {
		availableDesigns.featured.forEach( ( design: Design ) => {
			const href = getDesignImageUrl( design );
			const link = document.createElement( 'link' );
			link.rel = 'prefetch';
			link.as = 'image';
			link.href = href;
			document.head.appendChild( link );
		} );
	}
}
