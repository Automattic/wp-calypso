import fs from 'fs';
import { DataHelper } from '@automattic/calypso-e2e';
import { Uint8ArrayReader, Uint8ArrayWriter, ZipWriter } from '@zip.js/zip.js';
import FormData from 'form-data';

// Note: the media/new upload endpoint for the ToS destination blog is
// IP-allowlisted. Off-allowlist requests (e.g. local runs) get HTTP 400
// `rest_upload_ip_invalid` and the returned JSON has no `media`, so the
// tos-screenshots specs only pass from a CI agent with a valid IP. The
// screenshot capture steps themselves run fine anywhere.
export default async function uploadScreenshotsToBlog( zipFilename, globPattern ) {
	const zip = new ZipWriter( new Uint8ArrayWriter() );
	for ( const file of fs.globSync( globPattern ) ) {
		await zip.add( file, new Uint8ArrayReader( fs.readFileSync( file ) ), {
			lastModDate: fs.statSync( file ).mtime,
		} );
	}

	const form = new FormData();
	const bearerToken = DataHelper.getTosUploadToken();
	form.append( 'media[]', Buffer.from( await zip.close() ), { filename: zipFilename } );
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
