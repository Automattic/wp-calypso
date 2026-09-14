import fs from 'fs';
import { DataHelper } from '@automattic/calypso-e2e';
import archiver from 'archiver';
import FormData from 'form-data';

// Note: the media/new upload endpoint for the ToS destination blog is
// IP-allowlisted. Off-allowlist requests (e.g. local runs) get HTTP 400
// `rest_upload_ip_invalid` and the returned JSON has no `media`, so the
// tos-screenshots specs only pass from a CI agent with a valid IP. The
// screenshot capture steps themselves run fine anywhere.
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
	form.append( 'media[]', fs.readFileSync( zipFilename ), { filename: zipFilename } );
	const response = await fetch(
		`https://public-api.wordpress.com/rest/v1.1/sites/${ DataHelper.getTosUploadDestination() }/media/new`,
		{
			method: 'POST',
			body: form.getBuffer(),
			headers: {
				Authorization: `Bearer ${ bearerToken }`,
				...form.getHeaders(),
			},
		}
	);
	return response.json();
}
