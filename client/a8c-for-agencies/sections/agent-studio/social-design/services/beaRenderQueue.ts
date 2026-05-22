import { renderBeaHtmlToPng } from './renderBeaPng';
import type { OutputSize } from '../types';

// Rasterizing Bea HTML to PNG is expensive. The masonry can hold 60+ tiles,
// so rendering them all at once janks the page and "looks broken" mid-calc.
// This queue keeps the work async and bounded: at most a few tiles rasterize
// at a time, results are cached by HTML so a tile never renders twice, and
// in-flight requests are deduped.

const MAX_CONCURRENT = 1;
// Tiles display at ~260px wide; the source layouts are 600-1200px wide, so a
// low pixel ratio is still crisp on retina and keeps rasterizing fast.
const TILE_PIXEL_RATIO = 0.6;

const cache = new Map< string, string >();
const pending = new Map< string, Promise< string > >();
let active = 0;
let paused = false;
const waiting: Array< () => void > = [];

function drainQueue(): void {
	if ( paused ) {
		return;
	}
	while ( active < MAX_CONCURRENT && waiting.length > 0 ) {
		active += 1;
		waiting.shift()?.();
	}
}

function acquireSlot(): Promise< void > {
	if ( ! paused && active < MAX_CONCURRENT ) {
		active += 1;
		return Promise.resolve();
	}
	return new Promise( ( resolve ) => waiting.push( resolve ) );
}

function releaseSlot(): void {
	active = Math.max( 0, active - 1 );
	drainQueue();
}

export function setBeaTileRenderingPaused( nextPaused: boolean ): void {
	paused = nextPaused;
	if ( ! paused ) {
		drainQueue();
	}
}

/** Cached, concurrency-limited rasterization of one Bea tile. */
export function renderBeaTile( html: string, size: OutputSize ): Promise< string > {
	const cached = cache.get( html );
	if ( cached ) {
		return Promise.resolve( cached );
	}

	const inFlight = pending.get( html );
	if ( inFlight ) {
		return inFlight;
	}

	const task = ( async () => {
		await acquireSlot();
		try {
			const dataUrl = await renderBeaHtmlToPng( html, size, {
				pixelRatio: TILE_PIXEL_RATIO,
			} );
			cache.set( html, dataUrl );
			return dataUrl;
		} finally {
			releaseSlot();
			pending.delete( html );
		}
	} )();

	pending.set( html, task );
	return task;
}

/** Synchronous cache peek — lets a tile show instantly if already rendered. */
export function peekBeaTile( html: string ): string | undefined {
	return cache.get( html );
}
