import { EventEmitter } from 'node:events';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getImportFailure, watchImportFailure } from '../lib/import-failure';
import type { Page } from 'playwright';

// Polled by the Playground importer in TeamCity build 19794618 (#39127): the
// import failed while `importStatus` stayed `?` and the UI showed no error.
const SSH_EXEC_FAILED_ENVELOPE = {
	code: 200,
	headers: [ { name: 'Content-Type', value: 'application/json' } ],
	body: {
		importId: null,
		siteId: null,
		type: null,
		importStatus: '?',
		errorData: {
			description: 'An error occurred while importing your content. Import reference #116743338749',
			type: 'importError',
			code: 'ssh_exec_failed',
		},
		customData: { current_step: 'download_archive', message: '' },
	},
};

// Polled by the same run a minute earlier, between import steps.
const HANDOVER_ENVELOPE = {
	code: 200,
	headers: [ { name: 'Content-Type', value: 'application/json' } ],
	body: {
		importId: null,
		siteId: null,
		type: null,
		importStatus: '?',
		customData: { current_step: 'convert_to_atomic', message: '' },
	},
};

const IMPORTING = {
	importId: '6abe46dd09088',
	siteId: 257703190,
	type: 'wordpress',
	importStatus: 'importing',
	customData: { current_step: 'convert_to_atomic', message: '' },
	progress: { steps: { completed: 0, total: 9 } },
	importerFileType: 'playground',
};

const IMPORT_SUCCESS = {
	...IMPORTING,
	importStatus: 'importSuccess',
	progress: { steps: { completed: 9, total: 9 } },
};

describe( 'getImportFailure', () => {
	test( 'reports the error code and import reference of a failed import', () => {
		expect( getImportFailure( SSH_EXEC_FAILED_ENVELOPE ) ).toBe(
			'ssh_exec_failed (Import reference #116743338749)'
		);
	} );

	test( 'reads a body that is not wrapped in an HTTP envelope', () => {
		expect( getImportFailure( SSH_EXEC_FAILED_ENVELOPE.body ) ).toBe(
			'ssh_exec_failed (Import reference #116743338749)'
		);
	} );

	test( 'reports an import whose status is importFailure', () => {
		expect( getImportFailure( { ...IMPORTING, importStatus: 'importFailure' } ) ).toBe(
			'importFailure'
		);
	} );

	test( 'finds the failed import among several', () => {
		expect( getImportFailure( [ IMPORTING, SSH_EXEC_FAILED_ENVELOPE.body ] ) ).toBe(
			'ssh_exec_failed (Import reference #116743338749)'
		);
	} );

	test( 'falls back to the error type when there is no error code', () => {
		expect(
			getImportFailure( {
				importStatus: 'importStopped',
				errorData: { type: 'importError', description: 'Import reference #42' },
			} )
		).toBe( 'importError (Import reference #42)' );
	} );

	test( 'falls back to the whole description when it carries no reference', () => {
		expect(
			getImportFailure( {
				importStatus: '?',
				errorData: { code: 'some_error', description: 'Something broke.' },
			} )
		).toBe( 'some_error (Something broke.)' );
	} );

	test.each( [
		[ 'an import in progress', IMPORTING ],
		[ 'an import between steps', HANDOVER_ENVELOPE ],
		[ 'a successful import', IMPORT_SUCCESS ],
		[ 'no imports', [] ],
		[ 'an empty body', null ],
		[ 'a non-object body', 'Bad Gateway' ],
	] )( 'returns null for %s', ( _name, body ) => {
		expect( getImportFailure( body ) ).toBeNull();
	} );
} );

const IMPORTS_URL = 'https://public-api.wordpress.com/rest/v1.1/sites/1/imports/?http_envelope=1';

// The Playground importer polls its own import.
const IMPORT_URL =
	'https://public-api.wordpress.com/rest/v1.1/sites/1/imports/6abe46dd09088?http_envelope=1';

const STEP_TIMEOUT = 3 * 60 * 1000;

/**
 * A response as the watcher reads it: its method, URL and JSON body.
 */
function fakeResponse( url: string, json: () => Promise< unknown >, method = 'GET' ) {
	return { request: () => ( { method: () => method } ), url: () => url, json };
}

/**
 * Emits the responses on a fake page being watched, and reports whether the
 * watch rejected and with what.
 */
async function watchResponses(
	responses: ReturnType< typeof fakeResponse >[],
	{ stopFirst = false } = {}
): Promise< { error: Error | null; listeners: number } > {
	const page = new EventEmitter();
	const { failed, stop } = watchImportFailure( page as unknown as Page, STEP_TIMEOUT );
	let error: Error | null = null;
	failed.catch( ( rejection: Error ) => {
		error = rejection;
	} );

	if ( stopFirst ) {
		stop();
	}

	for ( const response of responses ) {
		page.emit( 'response', response );
	}

	// Let the listeners read the bodies and settle `failed`.
	await new Promise( ( resolve ) => setImmediate( resolve ) );
	stop();

	return { error, listeners: page.listenerCount( 'response' ) };
}

describe( 'watchImportFailure', () => {
	test( 'rejects when the imports poll reports a failure', async () => {
		const { error } = await watchResponses( [
			fakeResponse( IMPORTS_URL, async () => SSH_EXEC_FAILED_ENVELOPE ),
		] );

		expect( error?.message ).toBe(
			'The import failed on WordPress.com: ssh_exec_failed (Import reference #116743338749)'
		);
	} );

	test( 'keeps watching past bodies it cannot read', async () => {
		const { error } = await watchResponses( [
			fakeResponse( IMPORTS_URL, async () => {
				throw new Error( 'Response body is unavailable' );
			} ),
			fakeResponse( IMPORTS_URL, async () => SSH_EXEC_FAILED_ENVELOPE ),
		] );

		expect( error?.message ).toContain( 'ssh_exec_failed' );
	} );

	test( 'rejects when the Playground import poll reports a failure', async () => {
		const { error } = await watchResponses( [
			fakeResponse( IMPORT_URL, async () => SSH_EXEC_FAILED_ENVELOPE ),
		] );

		expect( error?.message ).toContain( 'ssh_exec_failed' );
	} );

	test.each( [
		[ 'a healthy poll', fakeResponse( IMPORTS_URL, async () => HANDOVER_ENVELOPE ) ],
		[
			'a failure on a request other than GET',
			fakeResponse( IMPORTS_URL, async () => SSH_EXEC_FAILED_ENVELOPE, 'POST' ),
		],
		[
			'a failure from an endpoint nested under an import',
			fakeResponse(
				'https://public-api.wordpress.com/rest/v1.1/sites/1/imports/123/authors/',
				async () => SSH_EXEC_FAILED_ENVELOPE
			),
		],
	] )( 'does not reject on %s', async ( _name, response ) => {
		const { error } = await watchResponses( [ response ] );

		expect( error ).toBeNull();
	} );

	test( 'stops watching once stopped', async () => {
		const { error, listeners } = await watchResponses(
			[ fakeResponse( IMPORTS_URL, async () => SSH_EXEC_FAILED_ENVELOPE ) ],
			{ stopFirst: true }
		);

		expect( error ).toBeNull();
		expect( listeners ).toBe( 0 );
	} );
} );

/**
 * Watches a fake page, emits each poll after its delay, wrapped in an HTTP
 * envelope, and settles the reads, then reports whether the watch rejected and
 * with what.
 */
async function watchPolls( polls: [ number, unknown ][] ): Promise< Error | null > {
	const page = new EventEmitter();
	const { failed, stop } = watchImportFailure( page as unknown as Page, STEP_TIMEOUT );
	let error: Error | null = null;
	failed.catch( ( rejection: Error ) => {
		error = rejection;
	} );

	for ( const [ delay, body ] of polls ) {
		await vi.advanceTimersByTimeAsync( delay );
		page.emit(
			'response',
			fakeResponse( IMPORT_URL, async () => ( { code: 200, headers: [], body } ) )
		);
	}

	await vi.advanceTimersByTimeAsync( 0 );
	stop();

	return error;
}

const step = ( current_step?: string ) => ( {
	...IMPORTING,
	customData: current_step ? { current_step, message: '' } : undefined,
} );

describe( 'watchImportFailure stall detection', () => {
	afterEach( () => {
		vi.useRealTimers();
	} );

	test( 'rejects naming the step that outlasts the step timeout', async () => {
		vi.useFakeTimers();

		const error = await watchPolls( [
			[ 0, step() ],
			[ 5000, step( 'convert_to_atomic' ) ],
			[ STEP_TIMEOUT / 2, step( 'convert_to_atomic' ) ],
			[ STEP_TIMEOUT / 2, step( 'convert_to_atomic' ) ],
		] );

		expect( error?.message ).toBe(
			'The import stalled on WordPress.com at convert_to_atomic for 180s'
		);
	} );

	test( 'rejects when the import never reports a step', async () => {
		vi.useFakeTimers();

		const error = await watchPolls( [ [ STEP_TIMEOUT, step() ] ] );

		expect( error?.message ).toBe( 'The import stalled on WordPress.com at unset for 180s' );
	} );

	test( 'restarts the timeout on each new step', async () => {
		vi.useFakeTimers();

		const error = await watchPolls( [
			[ 0, step( 'convert_to_atomic' ) ],
			[ STEP_TIMEOUT - 1000, step( 'download_archive' ) ],
			[ STEP_TIMEOUT - 1000, step( 'unpack_file' ) ],
			[ STEP_TIMEOUT - 1000, IMPORT_SUCCESS ],
		] );

		expect( error ).toBeNull();
	} );

	test( 'stops timing once the import succeeds', async () => {
		vi.useFakeTimers();

		const error = await watchPolls( [
			[ 0, IMPORT_SUCCESS ],
			[ STEP_TIMEOUT * 2, IMPORT_SUCCESS ],
		] );

		expect( error ).toBeNull();
	} );

	test.each( [
		[ 'a list of imports', [ step( 'download_archive' ) ] ],
		[ 'a poll that names no step', step() ],
	] )( 'keeps timing the step past %s', async ( _name, body ) => {
		vi.useFakeTimers();

		const error = await watchPolls( [
			[ 0, step( 'convert_to_atomic' ) ],
			[ STEP_TIMEOUT - 1000, body ],
			[ 1000, step( 'convert_to_atomic' ) ],
		] );

		expect( error?.message ).toContain( 'at convert_to_atomic' );
	} );

	test( 'stops timing once stopped', async () => {
		vi.useFakeTimers();
		const page = new EventEmitter();
		const { failed, stop } = watchImportFailure( page as unknown as Page, STEP_TIMEOUT );
		let error: Error | null = null;
		failed.catch( ( rejection: Error ) => {
			error = rejection;
		} );

		stop();
		await vi.advanceTimersByTimeAsync( STEP_TIMEOUT * 2 );

		expect( error ).toBeNull();
	} );
} );
