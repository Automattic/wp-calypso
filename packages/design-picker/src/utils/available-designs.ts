/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import { availableDesignsConfig } from './available-designs-config';
import { DESIGN_IMAGE_FOLDER } from '../constants';
import { shuffleArray } from './shuffle';
import type { MShotsOptions } from '../components/mshots-image';
import type { Design } from '../types';
import type { AvailableDesigns } from './available-designs-config';

function getCanUseWebP() {
	if ( typeof window !== 'undefined' ) {
		const elem = document.createElement( 'canvas' );
		if ( elem.getContext?.( '2d' ) ) {
			return elem.toDataURL( 'image/webp' ).indexOf( 'data:image/webp' ) === 0;
		}
	}
	return false;
}

export const getDesignUrl = ( design: Design, locale: string ): string => {
	const theme = encodeURIComponent( design.theme );
	const template = encodeURIComponent( design.template );

	// e.g. https://public-api.wordpress.com/rest/v1/template/demo/rockfield/rockfield?font_headings=Playfair%20Display&font_base=Fira%20Sans&site_title=Rockfield&viewport_height=700&language=en
	return addQueryArgs(
		`https://public-api.wordpress.com/rest/v1/template/demo/${ theme }/${ template }`,
		{
			font_headings: design.fonts?.headings,
			font_base: design.fonts?.base,
			site_title: design.title,
			viewport_height: 700,
			language: locale,
			use_screenshot_overrides: true,
		}
	);
};

// Used for both prefetching and loading design screenshots
export const mShotOptions = (): MShotsOptions => {
	// Take care changing these values, as the design-picker CSS animations are written for these values (see the *__landscape and *__portrait classes)
	if ( isEnabled( 'gutenboarding/long-previews' ) ) {
		return { vpw: 1600, vph: 1600, w: 600, screen_height: 3600 };
	}
	if ( isEnabled( 'gutenboarding/landscape-preview' ) ) {
		return { vpw: 1600, vph: 1600, w: 600, h: 600 };
	}
	return { vpw: 1600, vph: 3000, w: 600, h: 1124 };
};

const canUseWebP = getCanUseWebP();

// Bump the version query param here to cache bust the images after running bin/generate-gutenboarding-design-thumbnails.js
export const getDesignImageUrl = ( design: Design ): string => {
	return `/calypso/${ DESIGN_IMAGE_FOLDER }/${ design.slug }_${ design.template }_${
		design.theme
	}.${ canUseWebP ? 'webp' : 'jpg' }?v=3`;
};

interface AvailableDesignsOptions {
	includeAlphaDesigns?: boolean;
	useFseDesigns?: boolean;
	randomize?: boolean;
}
export function getAvailableDesigns( {
	includeAlphaDesigns = isEnabled( 'gutenboarding/alpha-templates' ),
	useFseDesigns = isEnabled( 'gutenboarding/site-editor' ),
	randomize = false,
}: AvailableDesignsOptions = {} ): AvailableDesigns {
	let designs = { ...availableDesignsConfig };

	// We can tell different environments (via the config JSON) to show pre-prod "alpha" designs.
	// Otherwise they'll be hidden by default.
	// Here we filter out designs that have been marked as alpha in available-designs-config.json
	if ( ! includeAlphaDesigns ) {
		designs = {
			...designs,
			featured: designs.featured.filter( ( design ) => ! design.is_alpha ),
		};
	}

	// If we are in the FSE flow, only show FSE designs. In normal flows, remove
	// the FSE designs.
	designs = {
		...designs,
		featured: designs.featured.filter( ( design ) =>
			useFseDesigns ? design.is_fse : ! design.is_fse
		),
	};

	if ( randomize ) {
		designs.featured = shuffleArray( designs.featured );
	}

	// Force blank canvas design to always be first in the list
	designs.featured = designs.featured.sort(
		( a, b ) => Number( isBlankCanvasDesign( b ) ) - Number( isBlankCanvasDesign( a ) )
	);

	return designs;
}

export function isBlankCanvasDesign( design: Design ): boolean {
	return /blank-canvas/i.test( design.slug );
}
