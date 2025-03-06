import { zipWpContent, type PlaygroundClient } from '@wp-playground/client';
import wp from 'calypso/lib/wp';
import { uploadExportFile, updateImporter, createClearOrder } from 'calypso/state/imports/actions';

export async function getSiteZip( playground: PlaygroundClient ): Promise< File > {
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

export async function clearImport( siteId: number, importId: string ) {
	await updateImporter( siteId, createClearOrder( siteId, importId ) );
}

export async function getImportStatus( siteId: number ): Promise< string > {
	const data = await wp.req.get( `/sites/${ siteId }/imports/` );
	return data.importStatus;
}
