/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */

/* Used to update wp-desktop repository README prior to application deployments */

// External Dependencies
const path = require( 'path' );
const https = require( 'https' );
const { promisify } = require( 'util' );
const exec = promisify( require( 'child_process' ).exec );

// Module Constants

const VERSION = process.env.VERSION
	? process.env.VERSION.replace( 'desktop-', '' )
	: ( function () {
			throw new Error( 'Error: no version' );
	  } )();

async function request( method = 'GET', postData ) {
	const params = {
		method,
		port: 443,
		hostname: 'api.github.com',
		path: `/repos/Automattic/wp-desktop/contents/README.md`,
		headers: {
			'User-Agent': 'wp-desktop',
			Accept: 'application/json',
			Authorization: 'token ' + process.env.WP_DESKTOP_SECRET,
		},
	};

	return new Promise( ( resolve, reject ) => {
		const req = https.request( params, ( res ) => {
			if ( res.statusCode < 200 || res.statusCode >= 300 ) {
				return reject( new Error( `Status Code ${ res.statusCode }: ${ res.statusMessage }` ) );
			}

			const data = [];

			res.on( 'data', ( chunk ) => {
				data.push( chunk );
			} );

			res.on( 'end', () => resolve( Buffer.concat( data ).toString() ) );
		} );

		req.on( 'error', reject );

		if ( postData ) {
			req.write( postData );
		}

		req.end();
	} );
}

async function updateWpDesktopREADME() {
	// Get blob sha for resource
	const { sha } = JSON.parse( await request( 'GET' ) );

	// Make changelog
	const { stdout: changelog } = await exec(
		`cd "${ path.resolve( __dirname, '..' ) }" && ./make-changelog.sh`
	);
	const content = Buffer.from(
		`## WP-Desktop ${ VERSION }` +
			`\n\nNote: The source code for this project is now maintained at https://github.com/Automattic/wp-calypso/tree/trunk/desktop.` +
			` This repository is used for deployment and issue-reporting purposes only.` +
			`\n\n` +
			changelog
	).toString( 'base64' ); // Github API: patch needs to be base-64 encoded

	const params = {
		message: `Bump version to ${ VERSION } `,
		content,
		sha,
	};

	const body = JSON.stringify( params );

	await request( 'PUT', body );
}

updateWpDesktopREADME();
