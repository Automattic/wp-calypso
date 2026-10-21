import { bumpStat } from './analytics';

// Marks a page load as a chunk-load retry. Mirrors the classic Calypso
// mechanism in client/layout/error.jsx: the flag lives in the URL for the whole
// retried load, so a chunk that is still missing afterwards surfaces the error
// instead of looping, no matter how long the failed fetch took.
const RETRY_PARAM = 'retry';

/**
 * Whether an error is a webpack chunk / dynamic import load failure.
 *
 * These happen when a lazily-loaded route or component chunk can't be fetched,
 * typically because a deploy replaced the chunk the running app is asking for.
 */
export function isChunkLoadError( error: Error ): boolean {
	// Webpack tags these failures with structured properties, which are more
	// stable than matching the error message: `name` is set on JS, ESM, and
	// native CSS chunk failures, while mini-css-extract uses `code` instead.
	return (
		error.name === 'ChunkLoadError' ||
		( error as { code?: string } ).code === 'CSS_CHUNK_LOAD_FAILED'
	);
}

function isRetry(): boolean {
	try {
		return new URLSearchParams( window.location.search ).get( RETRY_PARAM ) === '1';
	} catch {
		// If we can't read the URL, assume we already retried so we never loop.
		return true;
	}
}

/**
 * Recover from a chunk load failure by reloading the page once.
 *
 * A full reload pulls fresh script tags, so the chunk the app is asking for
 * matches what the server now serves. We only attempt this once per page load,
 * tracked by a `retry` URL param: if the chunk is still missing after the
 * reload the error surfaces normally instead of looping.
 *
 * Returns `true` if a reload was triggered, so callers can stop further error
 * handling for this error.
 */
export function maybeReloadForChunkError( error: Error ): boolean {
	if ( ! isChunkLoadError( error ) || isRetry() ) {
		return false;
	}

	bumpStat( 'calypso_chunk_retry', 'dashboard' );

	// Reload with the retry flag set so the fresh load serves the current chunks.
	const url = new URL( window.location.href );
	url.searchParams.set( RETRY_PARAM, '1' );
	window.location.replace( url.toString() );
	return true;
}
