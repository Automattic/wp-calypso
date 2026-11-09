import wpcomRequest from 'wpcom-proxy-request';
import { uploadExportFile, updateImporter } from 'calypso/state/imports/actions';
import { fromApi, toApi } from 'calypso/state/imports/api';
import { appStates } from 'calypso/state/imports/constants';
import { PLAYGROUND_HOST } from './constants';
import type { PlaygroundClient } from './types';
import type { ImportJob } from 'calypso/blocks/importer/types';

const POLL_INTERVAL_MS = 5000;
// 120 attempts × 5 s = 10 min. Atomic restores typically finish in 2–4 min;
// 10 min covers worst-case load spikes without leaving users stuck indefinitely.
const MAX_POLL_ATTEMPTS = 120;
const EXPORT_EXCLUDE_PATTERNS = [
	'/*',
	'!/wp-content/',
	'!/wp-content/**',
	'/wp-content/db.php',
	'/wp-content/mu-plugins/',
];

export type PlaygroundImportProgress =
	| { phase: 'packing' }
	| { phase: 'uploading'; percent?: number }
	| { phase: 'starting' }
	| { phase: 'importing'; job: ImportJob };

/**
 * Normalize an import status API response into the importer's ImportJob shape.
 */
function toImportJob( raw: unknown ): ImportJob {
	return fromApi( raw ) as ImportJob;
}

export class ImportTimeoutError extends Error {
	constructor() {
		super( 'Import timed out.' );
		this.name = 'ImportTimeoutError';
	}
}

export class ImportFailureError extends Error {
	constructor() {
		super( 'Import failed on WordPress.com.' );
		this.name = 'ImportFailureError';
	}
}

export class UnsupportedExportError extends Error {
	constructor( fileType?: string ) {
		super( `The upload was not recognized as a Playground export (${ fileType ?? 'unknown' }).` );
		this.name = 'UnsupportedExportError';
	}
}

/**
 * Start the import once its upload succeeds, and report whether it has started.
 * An upload sent with autoStart may already be importing. An upload the server
 * recognizes as another file type can never start from here, so it fails now.
 */
export async function ensureImportStarted( siteId: number, status: ImportJob ): Promise< boolean > {
	if ( status.importerState === appStates.IMPORTING ) {
		return true;
	}
	if ( status.importerState !== appStates.UPLOAD_SUCCESS ) {
		return false;
	}
	if ( status.importerFileType !== 'playground' ) {
		throw new UnsupportedExportError( status.importerFileType );
	}

	const startPayload = toApi( { ...status, importerState: appStates.IMPORTING } );
	await updateImporter( siteId, startPayload );
	return true;
}

export async function getSiteZip( playgroundSlug: string ) {
	const apiIframe = document.createElement( 'iframe' );
	apiIframe.hidden = true;
	apiIframe.setAttribute( 'sandbox', 'allow-scripts allow-same-origin' );
	document.body.appendChild( apiIframe );

	try {
		const { startPlaygroundAPI } = await import(
			/* webpackIgnore: true */ PLAYGROUND_HOST + '/client/index.js'
		);
		const playgroundAPI = await startPlaygroundAPI( {
			iframe: apiIframe,
			apiUrl: PLAYGROUND_HOST + '/api.html',
		} );
		const zipBlob = await playgroundAPI.exportSavedSiteAsZip( playgroundSlug, {
			excludePatterns: EXPORT_EXCLUDE_PATTERNS,
		} );

		if ( ! zipBlob ) {
			throw new Error( `No exportable saved Playground found for ${ playgroundSlug }.` );
		}

		return new File( [ zipBlob ], 'site.zip', { type: 'application/zip' } );
	} finally {
		apiIframe.remove();
	}
}

export async function removeSandboxPlugins( playground: PlaygroundClient ): Promise< void > {
	// Haydi and wccom-ai-connector are sandbox-only tools — remove them from the
	// mounted filesystem before exporting so they don't land on the live site.
	await playground.run( {
		code: `<?php
require_once '/wordpress/wp-load.php';
$plugins = [ 'haydi', 'wccom-ai-connector' ];

// Remove from active_plugins so the exported DB doesn't reference missing files.
$active = get_option( 'active_plugins', [] );
$active = array_values( array_filter( $active, function( $path ) use ( $plugins ) {
	foreach ( $plugins as $slug ) {
		if ( str_starts_with( $path, $slug . '/' ) ) {
			return false;
		}
	}
	return true;
} ) );
update_option( 'active_plugins', $active );

foreach ( $plugins as $slug ) {
	$dir = WP_PLUGIN_DIR . '/' . $slug;
	if ( ! is_dir( $dir ) ) { continue; }
	$it = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator( $dir, RecursiveDirectoryIterator::SKIP_DOTS ),
		RecursiveIteratorIterator::CHILD_FIRST
	);
	foreach ( $it as $f ) {
		$f->isDir() ? rmdir( $f->getPathname() ) : unlink( $f->getPathname() );
	}
	rmdir( $dir );
}`,
	} );

	// The saved-site exporter reads OPFS from a separate iframe, so wait until the
	// mount's asynchronous journal has persisted these changes.
	await playground.flushOpfs( '/wordpress' );
}

/**
 * Export the current Playground state, import it to a wp.com site, and wait
 * until the import finishes.
 *
 * onProgress reports each phase as it happens: packing the Playground site,
 * uploading it (with the browser's upload percentage when known), waiting for
 * the import to start, and then every polled import job status.
 */
export async function importPlaygroundSite(
	playgroundSlug: string,
	siteId: number,
	onProgress?: ( progress: PlaygroundImportProgress ) => void
): Promise< string > {
	onProgress?.( { phase: 'packing' } );
	const siteZip = await getSiteZip( playgroundSlug );

	onProgress?.( { phase: 'uploading' } );
	const importer = await uploadExportFile( siteId, {
		importStatus: { importStatus: 'importer-ready-for-upload', siteId, type: 'wordpress' },
		file: siteZip,
		autoStart: true,
		onprogress: ( event: ProgressEvent ) =>
			onProgress?.( {
				phase: 'uploading',
				percent: event.lengthComputable ? ( 100 * event.loaded ) / event.total : undefined,
			} ),
	} );
	let started = await ensureImportStarted( siteId, toImportJob( importer ) );

	const importId: string = importer.importId;
	onProgress?.( { phase: 'starting' } );

	// Poll until the import completes. After uploadSuccess, send the start trigger
	// — the backup_import job requires an explicit POST before beginning the
	// Atomic restore. Uses fromApi/toApi/appStates to match the rest of the
	// importer codebase rather than comparing raw API strings.
	for ( let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++ ) {
		const raw = await wpcomRequest< Record< string, unknown > >( {
			path: `/sites/${ siteId }/imports/${ importId }`,
			apiVersion: '1.1',
			method: 'GET',
		} );

		const status = toImportJob( raw );

		if ( status.importerState === appStates.IMPORT_FAILURE ) {
			throw new ImportFailureError();
		}

		if ( status.importerState === appStates.IMPORT_SUCCESS ) {
			onProgress?.( { phase: 'importing', job: status } );
			return importId;
		}

		if ( ! started ) {
			started = await ensureImportStarted( siteId, status );
		}

		// Report server-side progress only once the import has started; until
		// then it cannot proceed without this window.
		if ( started ) {
			onProgress?.( { phase: 'importing', job: status } );
		}

		if ( attempt < MAX_POLL_ATTEMPTS - 1 ) {
			await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL_MS ) );
		}
	}

	throw new ImportTimeoutError();
}
