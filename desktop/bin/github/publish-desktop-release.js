// External Dependencies
const fs = require( 'fs' );
const https = require( 'https' );
const path = require( 'path' );
const { isPrereleaseVersion } = require( './release-version-core' );

// Module Constants
const gitHubRepository = 'Automattic/wp-desktop';
const gitHubToken = process.env.GITHUB_TOKEN;
const version = process.env.VERSION
	? process.env.VERSION.replace( /^desktop-/, '' )
	: ( function () {
			throw new Error( 'Error: no version' );
	  } )();
const releaseName = `WP-Desktop ${ version.replace( /^v/, '' ) }`;
const isPrerelease = isPrereleaseVersion( version );
const releaseDirectory = path.resolve( __dirname, '..', '..', 'release' );
const changelogPath = path.resolve( __dirname, '..', '..', 'CHANGELOG.md' );

function assertToken() {
	if ( ! gitHubToken ) {
		throw new Error( 'Error: no GITHUB_TOKEN' );
	}
}

function request( method, requestPath, options = {} ) {
	const body = options.body ? JSON.stringify( options.body ) : null;
	const expectedStatusCodes = options.expectedStatusCodes || [ 200, 201, 204 ];
	const headers = {
		'User-Agent': 'wp-desktop',
		Accept: 'application/vnd.github+json',
		Authorization: 'token ' + gitHubToken,
		...options.headers,
	};

	if ( body ) {
		headers[ 'Content-Type' ] = 'application/json';
		headers[ 'Content-Length' ] = Buffer.byteLength( body );
	}

	const params = {
		method,
		port: 443,
		hostname: options.hostname || 'api.github.com',
		path: requestPath,
		headers,
	};

	return new Promise( ( resolve, reject ) => {
		const req = https.request( params, ( res ) => {
			const chunks = [];

			res.on( 'data', ( chunk ) => {
				chunks.push( chunk );
			} );

			res.on( 'end', () => {
				const responseBody = Buffer.concat( chunks ).toString();

				if ( ! expectedStatusCodes.includes( res.statusCode ) ) {
					const error = new Error(
						`Status Code ${ res.statusCode }: ${ res.statusMessage } ${ responseBody }`
					);
					error.statusCode = res.statusCode;
					return reject( error );
				}

				if ( responseBody.length === 0 ) {
					return resolve( null );
				}

				resolve( JSON.parse( responseBody ) );
			} );
		} );

		req.on( 'error', reject );

		if ( body ) {
			req.write( body );
		}

		req.end();
	} );
}

function upload( uploadUrl, filePath ) {
	const fileName = path.basename( filePath );
	const url = new URL( uploadUrl.replace( '{?name,label}', '' ) );
	const uploadPath = `${ url.pathname }?name=${ encodeURIComponent( fileName ) }`;

	const params = {
		method: 'POST',
		port: 443,
		hostname: url.hostname,
		path: uploadPath,
		headers: {
			'User-Agent': 'wp-desktop',
			Accept: 'application/vnd.github+json',
			Authorization: 'token ' + gitHubToken,
			'Content-Type': 'application/octet-stream',
			'Content-Length': fs.statSync( filePath ).size,
		},
	};

	return new Promise( ( resolve, reject ) => {
		const req = https.request( params, ( res ) => {
			const chunks = [];

			res.on( 'data', ( chunk ) => {
				chunks.push( chunk );
			} );

			res.on( 'end', () => {
				const responseBody = Buffer.concat( chunks ).toString();

				if ( res.statusCode !== 201 ) {
					return reject(
						new Error( `Status Code ${ res.statusCode }: ${ res.statusMessage } ${ responseBody }` )
					);
				}

				resolve( JSON.parse( responseBody ) );
			} );
		} );

		req.on( 'error', reject );

		const file = fs.createReadStream( filePath );
		file.on( 'error', reject );
		file.pipe( req );
	} );
}

async function getExistingRelease() {
	try {
		return await request(
			'GET',
			`/repos/${ gitHubRepository }/releases/tags/${ encodeURIComponent( version ) }`
		);
	} catch ( error ) {
		if ( error.statusCode === 404 ) {
			return null;
		}

		throw error;
	}
}

function getReleaseArtifacts() {
	const artifacts = fs
		.readdirSync( releaseDirectory, { withFileTypes: true } )
		.filter( ( artifact ) => artifact.isFile() )
		.map( ( artifact ) => path.join( releaseDirectory, artifact.name ) )
		.sort();

	if ( artifacts.length === 0 ) {
		throw new Error( `No release artifacts found in ${ releaseDirectory }` );
	}

	return artifacts;
}

async function publishRelease() {
	assertToken();

	const existingRelease = await getExistingRelease();

	if ( existingRelease ) {
		console.log( `Deleting existing release ${ existingRelease.html_url }` );
		await request( 'DELETE', `/repos/${ gitHubRepository }/releases/${ existingRelease.id }` );
	}

	console.log( `Publishing draft release for wp-desktop ${ version }...` );

	const release = await request( 'POST', `/repos/${ gitHubRepository }/releases`, {
		body: {
			tag_name: version,
			target_commitish: 'trunk',
			name: releaseName,
			body: fs.readFileSync( changelogPath, 'utf8' ),
			draft: true,
			prerelease: isPrerelease,
		},
	} );

	for ( const artifactPath of getReleaseArtifacts() ) {
		await upload( release.upload_url, artifactPath );
		console.log( `Uploaded ${ path.basename( artifactPath ) }` );
	}

	console.log( 'Publish complete' );
}

publishRelease().catch( ( error ) => {
	console.error( 'Failed to publish desktop release.' );
	console.error( error && error.stack ? error.stack : error );
	process.exitCode = 1;
} );
