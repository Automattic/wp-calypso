/* eslint-disable no-console */
import { zipWpContent, type PlaygroundClient } from '@wp-playground/client';

export async function getSiteZip( playground: PlaygroundClient ): Promise< File > {
	const zipBytes = await zipWpContent( playground, {
		selfContained: true,
	} );

	return new File( [ zipBytes ], 'site.zip', { type: 'application/zip' } );
}

export async function importPlaygroundSite(
	playground: PlaygroundClient,
	siteSlug: string
): Promise< string > {
	const siteZip = await getSiteZip( playground );
	console.log( 'siteZip', siteZip );
	console.log( 'siteSlug', siteSlug );
	const importId = await new Promise< string >( ( resolve ) => {
		setTimeout( () => {
			resolve( '123' );
		}, 1000 );
	} );
	return importId;
}

export async function getImportStatus( importId: string ): Promise< string > {
	console.log( 'getImportStatus', importId );
	const importStatus = new Promise< string >( ( resolve ) => {
		setTimeout( () => {
			resolve( 'completed' );
		}, 3000 );
	} );
	return importStatus;
}
