import type { Page, Response } from 'playwright';

const IMPORT_FAILURE_STATUS = 'importFailure';

// The importer polls `GET /rest/v1.1/sites/{id}/imports/?http_envelope=1`.
const IMPORTS_PATH_PATTERN = /\/sites\/[^/]+\/imports\/$/;

const IMPORT_REFERENCE_PATTERN = /Import reference #\d+/;

const GET_METHOD = 'GET';

interface ImportEntry {
	importStatus?: string;
	errorData?: { code?: string; type?: string; description?: string };
}

/**
 * Unwraps an `http_envelope=1` response, `{ code, headers, body }`, to its body.
 */
function unwrapEnvelope( body: unknown ): unknown {
	if ( ! body || typeof body !== 'object' || Array.isArray( body ) ) {
		return body;
	}

	const envelope = body as { code?: unknown; body?: unknown };
	if ( typeof envelope.code !== 'number' || ! ( 'body' in envelope ) ) {
		return body;
	}

	return envelope.body;
}

/**
 * Describes a failed import entry, e.g. `ssh_exec_failed (Import reference #123)`.
 */
function describeFailure( entry: ImportEntry ): string | null {
	const { errorData, importStatus } = entry;
	if ( ! errorData && importStatus !== IMPORT_FAILURE_STATUS ) {
		return null;
	}

	const code = errorData?.code ?? errorData?.type ?? importStatus;
	const description = errorData?.description;
	if ( ! description ) {
		return String( code );
	}

	const reference = description.match( IMPORT_REFERENCE_PATTERN )?.[ 0 ] ?? description;

	return `${ code } (${ reference })`;
}

/**
 * Returns a description of the first failed import in an imports status response
 * body, or null when no import has failed.
 *
 * WordPress.com reports a failed import with `errorData`, sometimes while
 * `importStatus` is still `?` and the Calypso importer shows no error screen.
 *
 * @param body The parsed JSON body of a `GET /sites/{id}/imports/` response.
 */
export function getImportFailure( body: unknown ): string | null {
	const unwrapped = unwrapEnvelope( body );
	const entries = Array.isArray( unwrapped ) ? unwrapped : [ unwrapped ];

	for ( const entry of entries ) {
		if ( ! entry || typeof entry !== 'object' ) {
			continue;
		}

		const failure = describeFailure( entry as ImportEntry );
		if ( failure ) {
			return failure;
		}
	}

	return null;
}

/**
 * Watches the importer's status poll and rejects `failed` as soon as it reports
 * a failed import. Call `stop` once done waiting.
 *
 * @param page The page running the importer.
 */
export function watchImportFailure( page: Page ): { failed: Promise< never >; stop: () => void } {
	let reject: ( error: Error ) => void = () => {};
	const failed = new Promise< never >( ( _resolve, rejectFailed ) => {
		reject = rejectFailed;
	} );
	// Nobody awaits `failed` once the import has succeeded.
	failed.catch( () => {} );

	const onResponse = async ( response: Response ) => {
		if ( response.request().method() !== GET_METHOD ) {
			return;
		}

		if ( ! IMPORTS_PATH_PATTERN.test( new URL( response.url() ).pathname ) ) {
			return;
		}

		// A navigation can evict the body, and a poll can answer with something
		// other than JSON; the next poll is a few seconds away.
		let body: unknown;
		try {
			body = await response.json();
		} catch {
			return;
		}

		const failure = getImportFailure( body );
		if ( failure ) {
			reject( new Error( `The import failed on WordPress.com: ${ failure }` ) );
		}
	};

	page.on( 'response', onResponse );

	return { failed, stop: () => page.off( 'response', onResponse ) };
}
