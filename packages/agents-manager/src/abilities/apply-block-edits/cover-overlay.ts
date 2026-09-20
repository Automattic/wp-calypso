/**
 * A cover block's overlay is derived from its image: the editor's media picker
 * recolours it, and keeps `isDark` in step, whenever the image changes. An
 * image the agent writes gets the same treatment.
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

/**
 * Recolours the overlay of a cover whose update gave it a new image, unless
 * the update sets an overlay of its own or the user chose the current one.
 */
export async function updateCoverOverlay(
	clientId: string,
	before: EditorBlock,
	requested: BlockAttributes | null | undefined,
	write: Write
): Promise< void > {
	const url = requested?.url;

	if (
		before.name !== COVER_BLOCK ||
		typeof url !== 'string' ||
		! url ||
		url === before.attributes.url ||
		requested?.overlayColor !== undefined ||
		requested?.customOverlayColor !== undefined ||
		before.attributes.isUserOverlayColor === true
	) {
		return;
	}

	const { color, isDark } = await getImageColor( url );

	write( clientId, {
		overlayColor: undefined,
		customOverlayColor: color,
		isUserOverlayColor: false,
		isDark,
	} );
}
