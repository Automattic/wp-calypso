/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */

// External Dependencies
const https = require( 'https' );

// Module Constants
const buildName = process.env.CIRCLE_JOB;
const buildUrl = process.env.CIRCLE_BUILD_URL;
const pullRequestUserName = `@${ process.env.CIRCLE_USERNAME }` || '';
const pullRequestNum = process.env.CIRCLE_PULL_REQUEST
	? getPullNumber( process.env.CIRCLE_PULL_REQUEST )
	: null;

const gitHubReviewUsername = 'wp-desktop';
const calypsoProject = 'Automattic/wp-calypso';
const pullRequestSha = process.env.CIRCLE_SHA1;
const githubReviewsBaseUrl = `/repos/${ calypsoProject }/pulls/${ pullRequestNum }/reviews`;

async function request( method = 'GET', postData, path ) {
	const params = {
		method,
		port: 443,
		host: 'api.github.com',
		path: path ? path : githubReviewsBaseUrl,
		headers: {
			'User-Agent': 'wp-desktop',
			Authorization: 'token ' + process.env.WP_DESKTOP_SECRET,
		},
	};

	return new Promise( ( resolve, reject ) => {
		const req = https.request( params, ( res ) => {
			if ( res.statusCode < 200 || res.statusCode >= 300 ) {
				return reject( new Error( `Status Code: ${ res.statusCode }` ) );
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

function dismissReview( reviewId ) {
	const dismissReviewURL = githubReviewsBaseUrl + `/${ reviewId }/dismissals`;
	const body = JSON.stringify( { message: 'wp-desktop ci passing, closing review' } );
	return request( 'PUT', body, dismissReviewURL );
}

async function getReviews( dismiss ) {
	// exit if this is not a pull request
	if ( ! pullRequestNum ) {
		console.log( 'PR # is null (not in a pull request), exiting...' );
		return;
	}

	let reviewed = false;
	const response = await request( 'GET' );
	const reviews = JSON.parse( response );
	if ( reviews.length > 0 ) {
		for ( let i = 0; i < reviews.length; i++ ) {
			const review = reviews[ i ];
			if ( review.user.login === gitHubReviewUsername && review.state !== 'DISMISSED' ) {
				reviewed = true;
				if ( dismiss ) {
					const id = review.id;
					dismissReview( id );
				}
			}
		}
	}
	return reviewed;
}

async function addReview() {
	// exit if this is not a pull request
	if ( ! pullRequestNum ) {
		console.log( 'PR # is null (not in a pull request), exiting...' );
		return;
	}

	const alreadyReviewed = await getReviews( false );

	// if there are no existing reviews then create one
	if ( ! alreadyReviewed ) {
		const msg =
			`WordPress Desktop CI Failure for job "${ buildName }".` +
			`\n\n${ pullRequestUserName } please inspect this job's build steps for breaking changes at [this link](${ buildUrl }).` +
			` For temporal failures, you may try to "Rerun Workflow from Failed".` +
			`\n\nPlease also ensure this branch is rebased off latest Calypso.`;
		const createReviewParameters = {
			commit_id: pullRequestSha,
			body: msg,
			event: 'REQUEST_CHANGES',
		};

		const body = JSON.stringify( createReviewParameters );

		await request( 'POST', body );
	}
}

// get PR number from URL formatted like https://github.com/Automattic/wp-calypso/pull/12345
function getPullNumber( url ) {
	const components = url.split( '/' );
	if ( components.length > 0 ) {
		return components.pop();
	}
	return null;
}

module.exports = {
	addReview,
	getReviews,
};
