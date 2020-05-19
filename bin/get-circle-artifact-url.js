const https = require( 'https' );

const baseOptions = {
	host: 'circleci.com',
	port: 443,
	headers: {
		Accept: 'application/json',
	},
};

const basePath = '/api/v1.1/project/github/Automattic/wp-calypso';
const maxBuilds = 100;

async function getCircleArtifactUrl( pathMatchRegex ) {
	if ( ! pathMatchRegex instanceof RegExp ) {
		console.error( 'Expected a valid RegExp. Received: %o', pathMatchRegex );
		process.exit( 1 );
	}
	try {
		// Fetch recent successful master builds
		const builds = await httpsGetJsonPromise( {
			...baseOptions,
			path: `${ basePath }/tree/master?filter=successful&limit=${ maxBuilds }`,
		} );

		const buildNumbersWithArtifacts = builds
			.filter( ( build ) => build.has_artifacts )
			.map( ( build ) => build.build_num );

		for ( const buildNumber of buildNumbersWithArtifacts ) {
			const artifacts = await httpsGetJsonPromise( {
				...baseOptions,
				path: `${ basePath }/${ buildNumber }/artifacts`,
			} );
			const filteredArtifacts = artifacts.filter( ( artifact ) =>
				artifact.path.match( pathMatchRegex )
			);
			if ( filteredArtifacts.length ) {
				filteredArtifacts.forEach( ( artifact ) => console.log( artifact.url ) );
				process.exit( 0 );
			}
		}

		console.error( 'failed to find artifacts matching %s', pathMatchRegex );
		process.exit( 1 );
	} catch ( e ) {
		console.error( e );
		process.exit( 1 );
	}

	console.error( 'failed to get recent artifact from CircleCI matching %s', pathMatchRegex );
	process.exit( 1 );
}

function httpsGetJsonPromise( options ) {
	return new Promise( ( resolve, reject ) => {
		https.get( options, ( response ) => {
			let body = '';
			response.on( 'data', ( data ) => {
				body += data;
			} );
			response.on( 'end', () => resolve( JSON.parse( body ) ) );
			response.on( 'error', reject );
		} );
	} );
}

module.exports = getCircleArtifactUrl;
