/**
 * What a capture can and cannot show, kept out of the rasterizer chunk.
 *
 * Both of these are read on the ordinary tool-result path, where the large
 * editor-only rasterizer must not be pulled in. Neither needs it: one asks the
 * canvas whether a block has a box, the other only reads the files that came
 * back.
 */

import { getCanvasDocument } from '../editor-canvas';
import type { FilePart } from './capture';

/**
 * Which of the given blocks the canvas cannot show.
 *
 * A capture frames the union of the blocks it is given: when they fit a
 * screenful the band is centred on that union, and when they do not the
 * rasterizer gives each group its own band or falls back to the whole page. So
 * a block that resolves to a laid-out element is guaranteed to be in some
 * picture, and the only way to ask for one and not get it is for it not to
 * resolve at all.
 *
 * That is the case worth reporting. A reference block named for a comparison
 * and then silently absent leaves the model looking at the edited section on
 * its own, which reads as confirmation of a match it never saw.
 *
 * Matches the rasterizer's own test: a block scrolled out of view still has a
 * box and is fine, a block with no layout does not and cannot be framed.
 * @param clientIds Editor clientIds to check.
 * @returns Those that cannot appear in a capture.
 */
export function getUnframedClientIds( clientIds: string[] ): string[] {
	const canvasDocument = getCanvasDocument();

	if ( ! canvasDocument ) {
		return clientIds;
	}

	return clientIds.filter( ( clientId ) => {
		const element = canvasDocument.querySelector( `[data-block="${ clientId }"]` );

		if ( ! element ) {
			return true;
		}

		const rect = element.getBoundingClientRect();

		return rect.width <= 0 || rect.height <= 0;
	} );
}

/**
 * What shape of picture, or pictures, a capture came back as.
 *
 * Three outcomes, and a reader that cannot tell them apart will misread two of
 * them. A set of bands is several different places on one page, not several
 * attempts at the same place; a whole page is everything at once but too small
 * to read. Saying neither leaves both looking like an ordinary screenful.
 * @param fileParts The capture.
 * @returns A sentence about the set, or empty for a plain screenful.
 */
export function describeCaptureShape( fileParts: FilePart[] ): string {
	if ( fileParts[ 0 ]?.metadata?.fullPage ) {
		return 'It is the whole page, scaled down to fit, so body text will not be legible — read it for colour, type scale, spacing and section rhythm, and ask for a picture of a specific area when the wording or fine detail matters.';
	}

	if ( fileParts.length > 1 ) {
		return `There are ${ fileParts.length } pictures, each a different area of the page at full size, ordered top to bottom down the page.`;
	}

	return '';
}
