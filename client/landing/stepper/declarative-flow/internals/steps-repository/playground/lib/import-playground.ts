import wpcomRequest from 'wpcom-proxy-request';
import { uploadExportFile, updateImporter } from 'calypso/state/imports/actions';
import { fromApi, toApi } from 'calypso/state/imports/api';
import { appStates } from 'calypso/state/imports/constants';
import { PLAYGROUND_HOST } from './constants';
import type { PlaygroundClient } from './types';

const POLL_INTERVAL_MS = 5000;
// 120 attempts × 5 s = 10 min. Atomic restores typically finish in 2–4 min;
// 10 min covers worst-case load spikes without leaving users stuck indefinitely.
const MAX_POLL_ATTEMPTS = 120;

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

export async function getSiteZip( playground: PlaygroundClient ) {
	const { zipWpContent } = await import(
		/* webpackIgnore: true */ PLAYGROUND_HOST + '/client/index.js'
	);
	const zipBytes = await zipWpContent( playground, {
		selfContained: true,
	} );

	return new File( [ zipBytes ], 'site.zip', { type: 'application/zip' } );
}

export async function removeSandboxPlugins( playground: PlaygroundClient ): Promise< void > {
	// Haydi and wccom-ai-connector are sandbox-only tools — remove them from the
	// in-memory filesystem before exporting so they don't land on the live site.
	// The OPFS is read-only at this point (opfs-to-memfs boot) so this is safe.
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
}

/**
 * Export the current Playground state and import it to a wp.com site.
 *
 * Pass waitForCompletion: true when the caller has no surrounding Redux
 * importer machinery to handle the uploadSuccess → startImporting trigger
 * (e.g. the entrepreneur flow). Leave false (default) for flows that route
 * to importerWordpress afterwards — that step's Redux monitoring handles it.
 */
export async function importPlaygroundSite(
	playground: PlaygroundClient,
	siteId: number,
	{ waitForCompletion = false }: { waitForCompletion?: boolean } = {}
): Promise< string | undefined > {
	const siteZip = await getSiteZip( playground );

	const importer = await uploadExportFile( siteId, {
		importStatus: { importStatus: 'importer-ready-for-upload', siteId, type: 'wordpress' },
		file: siteZip,
	} );

	if ( ! waitForCompletion ) {
		return importer.importId;
	}

	const importId: string = importer.importId;

	// Poll until the import completes. After uploadSuccess, send the start trigger
	// — the backup_import job requires an explicit POST before beginning the
	// Atomic restore. Uses fromApi/toApi/appStates to match the rest of the
	// importer codebase rather than comparing raw API strings.
	let started = false;

	for ( let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++ ) {
		await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL_MS ) );

		const raw = await wpcomRequest< Record< string, unknown > >( {
			path: `/sites/${ siteId }/imports/${ importId }`,
			apiVersion: '1.1',
			method: 'GET',
		} );

		const status = fromApi( raw );

		if ( status.importerState === appStates.IMPORT_FAILURE ) {
			throw new ImportFailureError();
		}

		if ( status.importerState === appStates.IMPORT_SUCCESS ) {
			return importId;
		}

		if ( status.importerState === appStates.UPLOAD_SUCCESS && ! started ) {
			started = true;
			const startPayload = toApi( { ...status, importerState: appStates.IMPORTING } );
			await updateImporter( siteId, startPayload );
		}
	}

	throw new ImportTimeoutError();
}
