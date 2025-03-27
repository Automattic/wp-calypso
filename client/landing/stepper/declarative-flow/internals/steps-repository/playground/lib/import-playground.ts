import { zipWpContent, type PlaygroundClient } from '@wp-playground/client';
import { uploadExportFile } from 'calypso/state/imports/actions';

export async function getSiteZip( playground: PlaygroundClient ) {
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
