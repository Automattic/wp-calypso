/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { isEnabled } from '../../config';
import { mshotsUrl } from './components/mshots-image';
import type { Design } from './stores/onboard/types';
const availableDesignsConfig = require( './available-designs-config.json' );

interface AvailableDesigns {
	featured: Design[];
}

const availableDesigns: Readonly< AvailableDesigns > = availableDesignsConfig;

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

	return addQueryArgs(
		`https://public-api.wordpress.com/rest/v1/template/demo/${ theme }/${ template }`,
		{
			font_headings: design.fonts.headings,
			font_base: design.fonts.base,
			site_title: design.title,
			viewport_height: 700, // todo: this is part of the issue with rockfield, a value of 3072 here fixes the background image
			language: locale,
		}
	);
};

const canUseWebP = getCanUseWebP();

export const getDesignImageUrl = ( design: Design ): string => {
	return `/calypso/images/design-screenshots/${ design.slug }_${ design.template }_${
		design.theme
	}.${ canUseWebP ? 'webp' : 'jpg' }?v=3`;
};

// Asynchronously load available design images
export function prefetchDesignThumbs( locale: string ): void {
	if ( typeof window !== 'undefined' ) {
		getAvailableDesigns().featured.forEach( ( design: Design ) => {
			const href = mshotsUrl( getDesignUrl( design, locale ) );
			const link = document.createElement( 'link' );
			link.rel = 'prefetch';
			link.as = 'image';
			link.href = href;
			link.crossOrigin = 'anonymous';
			document.head.appendChild( link );
		} );
	}
}

export function getAvailableDesigns(
	includeAlphaDesigns: boolean = isEnabled( 'gutenboarding/alpha-templates' ),
	useFseDesigns: boolean = isEnabled( 'gutenboarding/site-editor' )
): AvailableDesigns {
	let designs = availableDesigns;

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

	return designs;
}

export default getAvailableDesigns();
