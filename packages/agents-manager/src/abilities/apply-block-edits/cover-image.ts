/**
 * A cover's image carries attributes the editor's media picker keeps in step:
 * the overlay and `isDark` from the image's colour, the focal point and
 * featured-image flag that belonged to the old image, and a dim ratio that
 * would hide a first image. An image the agent writes gets the same treatment.
 */

import type { BlockAttributes, EditorBlock } from '../../utils/editor-blocks';

const COVER_BLOCK = 'core/cover';

// White, like the editor's fallback: an image that cannot be read is more
// often light than dark.
const DEFAULT_COLOR = '#FFF';

type Write = ( clientId: string, attributes: BlockAttributes ) => void;

// Loaded on the first cover image, in their own chunk.
const loadColorLibraries = () =>
	Promise.all( [
		import( /* webpackChunkName: "am-cover-color" */ 'colord' ),
		import( /* webpackChunkName: "am-cover-color" */ 'fast-average-color' ),
	] );

/** The image's average colour as hex, and whether it reads as dark. */
async function getImageColor( url: string ): Promise< { color: string; isDark: boolean } > {
	const [ { colord }, { FastAverageColor } ] = await loadColorLibraries();
	const { r, g, b, a } = colord( DEFAULT_COLOR ).toRgb();
	let color = DEFAULT_COLOR;

	try {
		// A failed read resolves to the default colour rather than rejecting.
		color = (
			await new FastAverageColor().getColorAsync( url, {
				defaultColor: [ r, g, b, a * 255 ],
				silent: true,
			} )
		).hex;
	} catch {
		// Kept as the default.
	}

	return { color, isDark: colord( color ).isDark() };
}

const keepsOverlay = ( before: EditorBlock, requested: BlockAttributes ): boolean =>
	before.attributes.isUserOverlayColor === true ||
	requested.overlayColor !== undefined ||
	requested.customOverlayColor !== undefined;

/**
 * Writes what a cover's new image implies, after the update that set it. The
 * request's own values win; the overlay is left to a user who chose it.
 */
export async function updateCoverForImage(
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

	const derived: BlockAttributes = {
		focalPoint: undefined,
		useFeaturedImage: undefined,
		// A first image would otherwise sit under a full-strength overlay.
		...( before.attributes.url === undefined &&
			before.attributes.dimRatio === 100 && { dimRatio: 50 } ),
	};

	if ( ! keepsOverlay( before, requested ) ) {
		const { color, isDark } = await getImageColor( url );

		Object.assign( derived, {
			overlayColor: undefined,
			customOverlayColor: color,
			isUserOverlayColor: false,
			isDark,
		} );
	}

	write(
		clientId,
		Object.fromEntries( Object.entries( derived ).filter( ( [ key ] ) => ! ( key in requested ) ) )
	);
}
