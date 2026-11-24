import type { Page, Response } from 'playwright';

const IMPORT_FAILURE_STATUS = 'importFailure';

const IMPORT_SUCCESS_STATUS = 'importSuccess';

// Importers poll `GET /rest/v1.1/sites/{id}/imports/`; the Playground importer
// polls `GET /rest/v1.1/sites/{id}/imports/{importId}`.
const IMPORTS_PATH_PATTERN = /\/sites\/[^/]+\/imports\/(?:[^/]+\/?)?$/;

// The importer shows "Preparing your site for import" until a step is set.
const UNSET_STEP = 'unset';

const IMPORT_REFERENCE_PATTERN = /Import reference #\d+/;

const GET_METHOD = 'GET';

interface ImportEntry {
	importStatus?: string;
	errorData?: { code?: string; type?: string; description?: string };
	customData?: { current_step?: string };
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
 * Returns the step a single import is at, `importSuccess` once it has succeeded,
 * or null when the body is not a single import or names no step.
 */
function getImportStep( body: unknown ): string | null {
	const entry = unwrapEnvelope( body ) as ImportEntry | null;
	if ( entry?.importStatus === IMPORT_SUCCESS_STATUS ) {
		return IMPORT_SUCCESS_STATUS;
	}

	return entry?.customData?.current_step || null;
}

/**
 * Watches the importer's status poll and rejects `failed` as soon as it reports
 * a failed import, or once an import step has lasted `stepTimeoutMs`. Call
 * `stop` once done waiting.
 *
 * @param page          The page running the importer.
 * @param stepTimeoutMs How long an import step, unset included, may last.
 */
export function watchImportFailure(
	page: Page,
	stepTimeoutMs: number
): { failed: Promise< never >; stop: () => void } {
	let reject: ( error: Error ) => void = () => {};
	const failed = new Promise< never >( ( _resolve, rejectFailed ) => {
		reject = rejectFailed;
	} );
	// Nobody awaits `failed` once the import has succeeded.
	failed.catch( () => {} );

	let currentStep = UNSET_STEP;
	let stallTimer: NodeJS.Timeout | undefined;
	const timeStep = ( step: string ) => {
		currentStep = step;
		clearTimeout( stallTimer );
		if ( step === IMPORT_SUCCESS_STATUS ) {
			return;
		}

		stallTimer = setTimeout( () => {
			reject(
				new Error(
					`The import stalled on WordPress.com at ${ step } for ${ stepTimeoutMs / 1000 }s`
				)
			);
		}, stepTimeoutMs );
	};
	timeStep( UNSET_STEP );

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
			return;
		}

		const step = getImportStep( body );
		if ( step && step !== currentStep ) {
			timeStep( step );
		}
	};

	page.on( 'response', onResponse );

	return {
		failed,
		stop: () => {
			clearTimeout( stallTimer );
			page.off( 'response', onResponse );
		},
	};
}
