import wpcomRequest from 'wpcom-proxy-request';
import { uploadExportFile } from 'calypso/state/imports/actions';
import { PLAYGROUND_HOST } from './constants';
import type { PlaygroundClient } from './types';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 120; // 10 min

export async function getSiteZip( playground: PlaygroundClient ) {
	const { zipWpContent } = await import(
		/* webpackIgnore: true */ PLAYGROUND_HOST + '/client/index.js'
	);
	const zipBytes = await zipWpContent( playground, {
		selfContained: true,
	} );

	return new File( [ zipBytes ], 'site.zip', { type: 'application/zip' } );
}

async function removeSandboxPlugins( playground: PlaygroundClient ): Promise< void > {
	// Haydi and wccom-ai-connector are sandbox-only tools — remove them from the
	// in-memory filesystem before exporting so they don't land on the live site.
	// The OPFS is read-only at this point (opfs-to-memfs boot) so this is safe.
	await playground.run( {
		code: `<?php
require_once '/wordpress/wp-load.php';
$plugins = [ 'haydi', 'wccom-ai-connector' ];
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

export async function importPlaygroundSite(
	playground: PlaygroundClient,
	siteId: number
): Promise< void > {
	await removeSandboxPlugins( playground );

	const siteZip = await getSiteZip( playground );

	const importStatus = {
		importStatus: 'importer-ready-for-upload',
		siteId,
		type: 'wordpress',
	};

	const importer = await uploadExportFile( siteId, {
		importStatus,
		file: siteZip,
	} );

	const importId: string = importer.importId;

	// Poll until uploadSuccess, then trigger the restore, then poll to completion.
	// Playground (full-site backup) imports require an explicit POST after
	// uploadSuccess before the backup_import job begins the Atomic restore.
	let started = false;

	for ( let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++ ) {
		await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL_MS ) );

		const status = await wpcomRequest< {
			importId: string;
			importStatus: string;
			type: string;
			siteId: number;
		} >( {
			path: `/sites/${ siteId }/imports/${ importId }`,
			apiVersion: '1.1',
			method: 'GET',
		} );

		if ( status.importStatus === 'importFailure' ) {
			throw new Error( 'Import failed on WordPress.com.' );
		}

		if ( status.importStatus === 'importSuccess' ) {
			return;
		}

		if ( status.importStatus === 'uploadSuccess' && ! started ) {
			started = true;
			await wpcomRequest( {
				path: `/sites/${ siteId }/imports/${ importId }`,
				apiVersion: '1.1',
				method: 'POST',
				formData: [
					[
						'importStatus',
						JSON.stringify( {
							importerId: importId,
							importStatus: 'importing',
							type: status.type,
							siteId: status.siteId,
						} ),
					],
				],
			} );
		}
	}

	throw new Error( 'Import timed out.' );
}
