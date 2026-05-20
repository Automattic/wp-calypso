// Compose a primary brand logo with an optional partner logo into a single
// image data URL rendered as [primary] | [partner]. Returns one URL so every
// {{LOGO_URL}} site (cover, footer, b-logo) keeps working unchanged.
//
// Each input is first cropped to the bounding box of its non-transparent
// pixels — without this, a partner PNG with extra vertical padding renders
// smaller than the primary even when both occupy the same canvas height.
// After cropping, both logos scale to the same visible height so glyph mass
// matches.
//
// The final assembly is an SVG, not a canvas raster — at 20px in a footer a
// canvas-rasterized 1px separator scales below half a pixel and disappears,
// where an SVG line stays crisp. Ported from prototype/src/services/compositeLogo.ts.

import type { ElaPageTheme } from './types';

const VIEW_HEIGHT = 96;
// SIDE_GAP is the breathing room between each logo and the separator, in
// viewBox units. Composite renders at many sizes (~20px in the footer, ~60px+
// on covers) so the gap scales proportionally. 56 ≈ 12px on each side at
// footer scale.
const SIDE_GAP = 56;
const STROKE_WIDTH = 5;
const SEPARATOR_INSET = 0.08;
const ALPHA_THRESHOLD = 8;

export type DualLogoOrder = 'brand-first' | 'partner-first';

const SEPARATOR_BY_THEME: Record< ElaPageTheme, string > = {
	light: '#1A1A1A',
	ink: '#FFFFFF',
	brand: '#FFFFFF',
	accent: '#FFFFFF',
};

function loadImage( src: string ): Promise< HTMLImageElement > {
	return new Promise( ( resolve, reject ) => {
		const img = new Image();
		img.onload = () => resolve( img );
		img.onerror = () => reject( new Error( 'logo image failed to load' ) );
		img.src = src;
	} );
}

function escapeXmlAttr( s: string ): string {
	return s.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' );
}

interface CroppedLogo {
	url: string;
	w: number;
	h: number;
}

/**
 * Crop an image to the bounding box of its non-transparent pixels. Returns
 * a PNG data URL plus the cropped dimensions. If the image has no
 * transparency or canvas access is denied, returns the source as-is — the
 * caller still works, the user just doesn't get height normalization.
 * @param img - The loaded image to crop.
 * @returns Cropped data URL + cropped width/height.
 */
async function cropToVisibleBounds( img: HTMLImageElement ): Promise< CroppedLogo > {
	const canvas = document.createElement( 'canvas' );
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext( '2d' );
	if ( ! ctx ) {
		return { url: img.src, w: img.naturalWidth, h: img.naturalHeight };
	}
	ctx.drawImage( img, 0, 0 );

	let pixelData: Uint8ClampedArray;
	try {
		pixelData = ctx.getImageData( 0, 0, canvas.width, canvas.height ).data;
	} catch {
		return { url: img.src, w: img.naturalWidth, h: img.naturalHeight };
	}

	let minX = canvas.width;
	let minY = canvas.height;
	let maxX = -1;
	let maxY = -1;
	for ( let y = 0; y < canvas.height; y++ ) {
		for ( let x = 0; x < canvas.width; x++ ) {
			const alpha = pixelData[ ( y * canvas.width + x ) * 4 + 3 ];
			if ( alpha > ALPHA_THRESHOLD ) {
				if ( x < minX ) {
					minX = x;
				}
				if ( x > maxX ) {
					maxX = x;
				}
				if ( y < minY ) {
					minY = y;
				}
				if ( y > maxY ) {
					maxY = y;
				}
			}
		}
	}
	if ( maxX < 0 ) {
		return { url: img.src, w: canvas.width, h: canvas.height };
	}

	const cropW = maxX - minX + 1;
	const cropH = maxY - minY + 1;
	if ( cropW === canvas.width && cropH === canvas.height ) {
		return { url: canvas.toDataURL( 'image/png' ), w: cropW, h: cropH };
	}

	const cropCanvas = document.createElement( 'canvas' );
	cropCanvas.width = cropW;
	cropCanvas.height = cropH;
	const cctx = cropCanvas.getContext( '2d' );
	if ( ! cctx ) {
		return { url: img.src, w: canvas.width, h: canvas.height };
	}
	cctx.drawImage( img, minX, minY, cropW, cropH, 0, 0, cropW, cropH );
	return { url: cropCanvas.toDataURL( 'image/png' ), w: cropW, h: cropH };
}

/**
 * Compose primary + partner logos into a single SVG data URL.
 * @param primaryUrl - The brand's primary logo (URL or data URL).
 * @param partnerUrl - The partner logo to pair with the brand.
 * @param theme - The page theme; controls separator color.
 * @param order - Which logo sits on the leading edge of the separator.
 * @returns SVG data URL containing both logos joined by a vertical rule.
 */
export async function composeDualLogo(
	primaryUrl: string,
	partnerUrl: string,
	theme: ElaPageTheme = 'light',
	order: DualLogoOrder = 'brand-first'
): Promise< string > {
	const [ primaryImg, partnerImg ] = await Promise.all( [
		loadImage( primaryUrl ),
		loadImage( partnerUrl ),
	] );
	const [ primary, partner ] = await Promise.all( [
		cropToVisibleBounds( primaryImg ),
		cropToVisibleBounds( partnerImg ),
	] );

	const [ first, second ] = order === 'partner-first' ? [ partner, primary ] : [ primary, partner ];
	const firstW = ( first.w / first.h ) * VIEW_HEIGHT;
	const secondW = ( second.w / second.h ) * VIEW_HEIGHT;
	const sepX = firstW + SIDE_GAP;
	const totalW = firstW + SIDE_GAP * 2 + secondW;
	const insetY = VIEW_HEIGHT * SEPARATOR_INSET;
	const stroke = SEPARATOR_BY_THEME[ theme ];

	const firstHref = escapeXmlAttr( first.url );
	const secondHref = escapeXmlAttr( second.url );

	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ totalW.toFixed(
			2
		) } ${ VIEW_HEIGHT }" preserveAspectRatio="xMidYMid meet">` +
		`<image href="${ firstHref }" x="0" y="0" width="${ firstW.toFixed(
			2
		) }" height="${ VIEW_HEIGHT }" preserveAspectRatio="xMidYMid meet"/>` +
		`<line x1="${ sepX.toFixed( 2 ) }" y1="${ insetY.toFixed( 2 ) }" x2="${ sepX.toFixed(
			2
		) }" y2="${ ( VIEW_HEIGHT - insetY ).toFixed(
			2
		) }" stroke="${ stroke }" stroke-width="${ STROKE_WIDTH }" stroke-linecap="round"/>` +
		`<image href="${ secondHref }" x="${ ( sepX + SIDE_GAP ).toFixed(
			2
		) }" y="0" width="${ secondW.toFixed(
			2
		) }" height="${ VIEW_HEIGHT }" preserveAspectRatio="xMidYMid meet"/>` +
		'</svg>';

	return `data:image/svg+xml;utf8,${ encodeURIComponent( svg ) }`;
}
