import fs from 'fs';
import { DataHelper } from '@automattic/calypso-e2e';
import archiver from 'archiver';
import FormData from 'form-data';

export default async function uploadScreenshotsToBlog( zipFilename, globPattern ) {
	const archive = archiver( 'zip', {
		zlib: { level: 9 }, // Sets the compression level.
	} );
	const output = fs.createWriteStream( zipFilename );
	archive.pipe( output );
	archive.glob( globPattern );
	archive.finalize();

	const fsStreamEndPromise = new Promise( ( resolve ) => {
		return output.on( 'close', function () {
			return resolve( 'closed' );
		} );
	} );
	await fsStreamEndPromise;

	const form = new FormData();
	const bearerToken = DataHelper.getTosUploadToken();
	form.append( 'media[]', fs.createReadStream( zipFilename ) );
	const response = await fetch(
		`https://public-api.wordpress.com/rest/v1.1/sites/${ DataHelper.getTosUploadDestination() }/media/new`,
		{
			method: 'POST',
			body: form,
			headers: {
				Authorization: `Bearer ${ bearerToken }`,
			},
		}
	);
	return response.json();
}
