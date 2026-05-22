/* eslint-disable no-console */
import { resolvePackFonts } from '../brandPacks/loadFonts';
import { getOutput, saveOutput } from '../lib/storage';
import { renderBeaHtmlToPng } from './renderBeaPng';
import type { BrandPack } from '../brandPacks/types';
import type { OutputRender } from '../types';

// How many render tiles the project-screen collage shows.
const PREVIEW_COUNT = 4;
// Thumbnails only need to read at ~150px wide on the card, so render the
// full-size layout but rasterize at low pixel density to keep storage small.
const THUMB_PIXEL_RATIO = 0.5;

// Outputs whose thumbnails are being generated right now, so concurrent
// project-screen mounts don't kick off the same work twice.
const inFlight = new Set< string >();

/**
 * Generate the project-screen preview thumbnails for a Bea Output, once.
 *
 * Live-rendering HTML on every project-screen load is slow and blocks paint.
 * This rasterizes the first few renders to PNG a single time and persists them
 * on `output.previewThumbs`; later loads just show `<img>`. Safe to call
 * repeatedly — it no-ops if thumbnails already exist or are in flight.
 */
export async function ensureBeaPreviewThumbs( outputId: string, pack: BrandPack ): Promise< void > {
	if ( inFlight.has( outputId ) ) {
		return;
	}
	const output = getOutput( outputId );
	if ( ! output || output.agentId !== 'blog-asset-set' ) {
		return;
	}
	if ( output.status !== 'done' ) {
		return;
	}
	if ( output.previewThumbs && output.previewThumbs.length > 0 ) {
		return;
	}

	const picks = output.renders.filter( ( render ) => render.html ).slice( 0, PREVIEW_COUNT );
	if ( picks.length === 0 ) {
		return;
	}

	inFlight.add( outputId );
	try {
		await resolvePackFonts( pack );
		const thumbs: OutputRender[] = [];
		for ( const render of picks ) {
			try {
				const dataUrl = await renderBeaHtmlToPng( render.html!, render.size, {
					pixelRatio: THUMB_PIXEL_RATIO,
				} );
				thumbs.push( { size: render.size, dataUrl } );
			} catch ( err ) {
				console.warn( '[beaThumbnails] render failed', err );
			}
		}
		if ( thumbs.length === 0 ) {
			return;
		}

		// Re-read in case the Output changed while we were rasterizing.
		const latest = getOutput( outputId );
		if ( ! latest || latest.previewThumbs?.length ) {
			return;
		}
		saveOutput( { ...latest, previewThumbs: thumbs } );
	} catch ( err ) {
		console.warn( '[beaThumbnails] thumbnail generation failed', err );
	} finally {
		inFlight.delete( outputId );
	}
}
