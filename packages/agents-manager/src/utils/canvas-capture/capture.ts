/**
 * Captures the editor canvas as file parts for a tool result.
 *
 * The block tree cannot answer "does this look right": block attributes and
 * Additional CSS out-specify global styles, so a write can land as requested
 * and change nothing the user sees (BSKY-1999). The canvas iframe already
 * renders theme CSS, global styles, Additional CSS and unsaved editor state,
 * which an anonymous fetcher like mshots cannot see.
 */

import { getCanvasDocument } from '../editor-canvas';
import { recordBigSkyTracksEvent } from '../tracks';
import { rasterizeCanvas } from './rasterizer';
import type { FilePart } from '@automattic/agenttic-client';

/** A file sent alongside a tool result, in the agent client's wire shape. */
export type { FilePart };

export interface CanvasCaptureContext {
	/**
	 * The live canvas document. Read it synchronously: the editor can repaint at
	 * any time, so a rasterizer that awaits first may capture a different page.
	 */
	canvasDocument: Document;
	canvasWindow: Window;
	/** Blocks to frame the picture on, rather than wherever the user is scrolled; empty falls back to the current view. */
	clientIds: string[];
	/**
	 * The whole page rather than one screenful, scaled down to fit: body text
	 * is not readable, but colour, type scale and section rhythm are, which is
	 * what a theme or global styles change needs checking against.
	 */
	fullPage: boolean;
}

export type CanvasRasterizer = ( context: CanvasCaptureContext ) => Promise< FilePart[] | null >;

export interface CanvasCaptureOptions {
	/** Blocks to frame the capture on. */
	clientIds?: string[];
	fullPage?: boolean;
}

/**
 * A refused capture returns `null` and the tool reports its edit normally, so
 * nothing downstream can tell an agent that saw the page from one that got
 * nothing; this is the only record. Successes are not counted: the server can
 * see for itself whether an image arrived.
 */
function recordCaptureFailure( reason: string, fullPage: boolean ): void {
	recordBigSkyTracksEvent( 'jetpack_big_sky_canvas_capture_failed', {
		reason,
		full_page: fullPage,
	} );
}

/**
 * Captures the canvas, if it is mounted. Never throws or rejects: a failed
 * capture must not fail a successful edit, so every failure returns `null`,
 * which callers report as "no image".
 */
export async function captureCanvasFileParts( {
	clientIds = [],
	fullPage = false,
}: CanvasCaptureOptions = {} ): Promise< FilePart[] | null > {
	const canvasDocument = getCanvasDocument();
	const canvasWindow = canvasDocument?.defaultView;

	// The canvas is absent on non-editor screens, and briefly during editor
	// boot. Both are ordinary, not errors.
	if ( ! canvasDocument || ! canvasWindow ) {
		return null;
	}

	try {
		const fileParts = await rasterizeCanvas( {
			canvasDocument,
			canvasWindow,
			clientIds,
			fullPage,
		} );

		if ( ! fileParts?.length ) {
			recordCaptureFailure( 'empty', fullPage );

			return null;
		}

		return fileParts;
	} catch ( error ) {
		// Not logged: a refusal is a handled outcome, reported to Tracks. The
		// reason goes, not the message, which carries stylesheet hrefs and font
		// URLs that are unusable as an analytics property.
		recordCaptureFailure( ( error as { reason?: string } )?.reason || 'error', fullPage );

		return null;
	}
}
