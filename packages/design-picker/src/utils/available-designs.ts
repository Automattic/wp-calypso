import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { availableDesignsConfig } from './available-designs-config';
import { shuffleArray } from './shuffle';
import type { MShotsOptions } from '../components/mshots-image';
import type { Design, DesignUrlOptions } from '../types';
import type { AvailableDesigns } from './available-designs-config';

export const getDesignUrl = (
	design: Design,
	locale: string,
	options: DesignUrlOptions = {}
): string => {
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
			...options,
		}
	);
};

// Used for both prefetching and loading design screenshots
export const mShotOptions = ( { preview }: Design, highRes: boolean ): MShotsOptions => {
	// Take care changing these values, as the design-picker CSS animations are written for these values (see the *__landscape and *__portrait classes)
	return {
		vpw: 1600,
		vph: preview === 'static' ? 1040 : 1600,
		w: highRes ? 1200 : 600,
		screen_height: 3600,
	};
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
