import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps';

const packageJson = JSON.parse( await readFile( new URL( '../package.json', import.meta.url ) ) );
const directory = new URL( '../dist/', import.meta.url );
const html = await readFile( new URL( 'index.html', directory ) );
const gzipBytes = gzipSync( html, { level: 9 } ).length;
if ( html.length > 1.5 * 1024 * 1024 || gzipBytes > 350 * 1024 ) {
	throw new Error( 'The MCP app exceeds its production build budget.' );
}
const checksum = createHash( 'sha256' ).update( html ).digest( 'hex' );
const file = `${ checksum }.html`;
await rename( new URL( 'index.html', directory ), new URL( file, directory ) );
await writeFile(
	new URL( 'manifest.json', directory ),
	JSON.stringify(
		{
			version: packageJson.version,
			resourceUri: `ui://wpcom/agent-components/${ packageJson.version }/${ file }`,
			mimeType: RESOURCE_MIME_TYPE,
			checksum,
			file,
			bytes: html.length,
			gzipBytes,
			csp: { connectDomains: [], resourceDomains: [], frameDomains: [] },
		},
		null,
		2
	) + '\n'
);
