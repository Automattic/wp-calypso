import { isEnabled } from '@automattic/calypso-config';
import { shuffle } from '@automattic/js-utils';
import { addQueryArgs } from '@wordpress/url';
import { DEFAULT_VIEWPORT_WIDTH, MOBILE_VIEWPORT_WIDTH } from '../constants';
import { availableDesignsConfig } from './available-designs-config';
import type { AvailableDesigns } from './available-designs-config';
import type { Design, DesignUrlOptions } from '../types';
import type { MShotsOptions } from '@automattic/onboarding';

/** @deprecated used for Gutenboarding (/new flow) */
export const getDesignUrl = (
	design: Design,
	locale: string,
	options: DesignUrlOptions = {}
): string => {
	const repo = design.stylesheet ? design.stylesheet.split( '/' )[ 0 ] : 'pub';
	const theme = encodeURIComponent( design.theme );
	const template = encodeURIComponent( design.template );

	// e.g. https://public-api.wordpress.com/rest/v1.1/template/demo/pub/rockfield/rockfield?font_headings=Playfair%20Display&font_base=Fira%20Sans&site_title=Rockfield&viewport_height=700&language=en
	let url = addQueryArgs(
		`https://public-api.wordpress.com/rest/v1.1/template/demo/${ repo }/${ theme }/${ template }`,
		{
			font_headings: design.fonts?.headings,
			font_base: design.fonts?.base,
			viewport_height: 700,
			language: locale,
			use_screenshot_overrides: true,
			...options,
		}
	);

	if ( design.title ) {
		// The design url is sometimes used in a `background-image: url()` CSS rule and unescaped
		// parentheses in the URL break it. `addQueryArgs` and `encodeURIComponent` don't escape
		// parentheses so we've got to do it ourselves.
		url +=
			'&site_title=' +
			encodeURIComponent( design.title ).replace( /\(/g, '%28' ).replace( /\)/g, '%29' );
	}

	return url;
};

type MShotInputOptions = {
	scrollable?: boolean;
	highRes?: boolean;
	isMobile?: boolean;
};

// Used for both prefetching and loading design screenshots
export const getMShotOptions = ( {
	scrollable,
	highRes,
	isMobile,
}: MShotInputOptions = {} ): MShotsOptions => {
	// Take care changing these values, as the design-picker CSS animations are written for these values (see the *__landscape and *__portrait classes)
	return {
		vpw: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
		// 1040 renders well with all the current designs, more details in the links below.
		// See: #77052
		vph: scrollable ? 1600 : 1040,
		// When `w` was 1200 it created a visual glitch on one thumbnail. #57261
		w: highRes ? 1199 : 600,
		screen_height: 3600,
	};
};

type DesignFilter = ( design: Design ) => boolean;

interface AvailableDesignsOptions {
	includeAlphaDesigns?: boolean;
	featuredDesignsFilter?: DesignFilter;
	randomize?: boolean;
}

export const excludeFseDesigns: DesignFilter = ( design ) => ! design.is_fse;
export const includeFseDesigns: DesignFilter = ( design ) => !! design.is_fse;

/**
 * To prevent the accumulation of tech debt, make duplicate entries for all Universal
 * themes, one with `is_fse: true`, the other not. This tech debt can be eliminated
 * by using the REST API for themes rather than a hardcoded list.
 */
export function getAvailableDesigns( {
	includeAlphaDesigns = isEnabled( 'gutenboarding/alpha-templates' ),
	featuredDesignsFilter = excludeFseDesigns,
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

	// If we are opting into FSE, show only FSE designs.
	designs = {
		...designs,
		featured: designs.featured.filter( featuredDesignsFilter ),
	};

	if ( randomize ) {
		designs.featured = shuffle( designs.featured );
	}

	// Force designs using a "featured" term in the theme_picks taxonomy to always be first in the list.
	// For example: Blank Canvas.
	designs.featured = designs.featured.sort(
		( a, b ) => Number( !! b.is_featured_picks ) - Number( !! a.is_featured_picks )
	);

	return designs;
}

export function isBlankCanvasDesign( design?: Design ): boolean {
	if ( ! design ) {
		return false;
	}
	return /blank-canvas/i.test( design.slug ) && ! design.is_virtual;
}
