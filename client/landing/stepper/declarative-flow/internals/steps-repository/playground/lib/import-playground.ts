import { uploadExportFile } from 'calypso/state/imports/actions';
import { PLAYGROUND_HOST } from './constants';
import type { PlaygroundClient } from './types';

export async function getSiteZip( playground: PlaygroundClient ) {
	const { zipWpContent } = await import(
		/* webpackIgnore: true */ PLAYGROUND_HOST + '/client/index.js'
	);
	const zipBytes = await zipWpContent( playground, {
		selfContained: true,
	} );

	return new File( [ zipBytes ], 'site.zip', { type: 'application/zip' } );
}

export async function importPlaygroundSite(
	playground: PlaygroundClient,
	siteId: number
): Promise< string > {
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
	return importer.importId;
}
