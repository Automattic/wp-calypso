/**
 * The canvas capture facade. The rasterizer is large and editor-only, so it
 * loads as its own chunk on the first capture and stays out of every entry
 * until then.
 */

import { recordBigSkyTracksEvent } from '../tracks';
import type { CanvasCaptureOptions, FilePart } from './capture';

export type { CanvasCaptureOptions, FilePart };

type CaptureModule = typeof import( './capture' );

/**
 * Captures the editor canvas as file parts for a tool result. Never throws: a
 * capture rides along with an edit and must not fail it, so a chunk that will
 * not load resolves `null` like any other refused capture. A failed load
 * retries on the next call.
 */
export async function captureCanvas(
	options: CanvasCaptureOptions = {}
): Promise< FilePart[] | null > {
	let capture: CaptureModule;

	try {
		capture = await import( /* webpackChunkName: "am-canvas-capture" */ './capture' );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Failed to load the canvas capture:', error );

		recordBigSkyTracksEvent( 'jetpack_big_sky_canvas_capture_failed', {
			reason: 'unavailable',
			full_page: Boolean( options.fullPage ),
		} );

		return null;
	}

	return capture.captureCanvasFileParts( options );
}
