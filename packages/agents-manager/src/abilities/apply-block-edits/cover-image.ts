/**
 * A cover's image carries attributes the editor's media picker keeps in step:
 * the overlay and `isDark` from the image's colour, the focal point and
 * featured-image flag that belonged to the old image, and a dim ratio that
 * would hide a first image. An image the agent writes gets the same treatment.
 */

import { getPaletteColor } from '../../utils/editor-blocks';
import type { BlockAttributes, EditorBlock } from '../../utils/editor-blocks';

const COVER_BLOCK = 'core/cover';

// White, like the editor's fallback: an image that cannot be read is more
// often light than dark.
const DEFAULT_IMAGE_COLOR = '#FFF';

// The overlay a cover shows when none is chosen, from the block's stylesheet.
const DEFAULT_OVERLAY_COLOR = '#000';

type Colord = typeof import( 'colord' ).colord;
type Write = ( clientId: string, attributes: BlockAttributes ) => void;

// Loaded on the first cover image, in their own chunk.
const loadColorLibraries = () =>
	Promise.all( [
		import( /* webpackChunkName: "am-cover-color" */ 'colord' ),
		import( /* webpackChunkName: "am-cover-color" */ 'fast-average-color' ),
	] );

const asNumber = ( value: unknown ): number | undefined =>
	typeof value === 'number' ? value : undefined;

const setsOverlay = ( { overlayColor, customOverlayColor }: BlockAttributes ): boolean =>
	overlayColor !== undefined || customOverlayColor !== undefined;

/** The overlay `attributes` show; a palette slug the palette lacks is `undefined`. */
function getOverlayColor( {
	overlayColor,
	customOverlayColor,
}: BlockAttributes ): string | undefined {
	if ( typeof overlayColor === 'string' ) {
		return getPaletteColor( overlayColor );
	}

	return typeof customOverlayColor === 'string' ? customOverlayColor : DEFAULT_OVERLAY_COLOR;
}

/** Whether the overlay over the image reads as dark, as the editor judges it. */
function compositeIsDark(
	colord: Colord,
	dimRatio: number,
	overlayColor: string,
	imageColor: string
): boolean {
	if ( overlayColor === imageColor || dimRatio === 100 ) {
		return colord( overlayColor ).isDark();
	}

	const overlay = colord( overlayColor )
		.alpha( dimRatio / 100 )
		.toRgb();
	const image = colord( imageColor ).toRgb();
	const alpha = overlay.a + image.a * ( 1 - overlay.a );
	const channel = ( over: number, under: number ) =>
		over * overlay.a + under * image.a * ( 1 - overlay.a );

	return colord( {
		r: channel( overlay.r, image.r ),
		g: channel( overlay.g, image.g ),
		b: channel( overlay.b, image.b ),
		a: alpha,
	} ).isDark();
}

/**
 * Writes what a cover's new image implies, after the update that set it. The
 * request's own values win; the overlay is left to a user who chose it.
 */
export async function syncCoverWithImage(
	clientId: string,
	before: EditorBlock,
	requested: BlockAttributes | null | undefined,
	write: Write
): Promise< void > {
	const url = requested?.url;

	if (
		! requested ||
		before.name !== COVER_BLOCK ||
		typeof url !== 'string' ||
		! url ||
		url === before.attributes.url
	) {
		return;
	}

	const [ { colord }, { FastAverageColor } ] = await loadColorLibraries();
	let imageColor = DEFAULT_IMAGE_COLOR;

	try {
		imageColor = ( await new FastAverageColor().getColorAsync( url, { silent: true } ) ).hex;
	} catch {
		// An unreadable image keeps the default.
	}

	const derived: BlockAttributes = {
		focalPoint: undefined,
		useFeaturedImage: undefined,
		// A first image would otherwise sit under a full-strength overlay.
		...( before.attributes.url === undefined &&
			before.attributes.dimRatio === 100 && { dimRatio: 50 } ),
	};
	const requestsOverlay = setsOverlay( requested );
	const recolours = ! requestsOverlay && before.attributes.isUserOverlayColor !== true;

	if ( recolours ) {
		Object.assign( derived, {
			overlayColor: undefined,
			customOverlayColor: imageColor,
			isUserOverlayColor: false,
		} );
	}

	const overlayColor = recolours
		? imageColor
		: getOverlayColor( requestsOverlay ? requested : before.attributes );
	const dimRatio =
		asNumber( requested.dimRatio ) ??
		asNumber( derived.dimRatio ) ??
		asNumber( before.attributes.dimRatio ) ??
		100;

	if ( overlayColor ) {
		derived.isDark = compositeIsDark( colord, dimRatio, overlayColor, imageColor );
	}

	write(
		clientId,
		Object.fromEntries( Object.entries( derived ).filter( ( [ key ] ) => ! ( key in requested ) ) )
	);
}
