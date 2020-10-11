/* eslint-disable no-console */

/**
 * External dependencies
 */
const { Octokit } = require( '@octokit/core' );

/**
 * Internal dependencies
 */
const { isHittingRateLimit, warnOfRateLimit, sleepUntilRateLimitOver } = require( './rate-limit' );
const { getPulls, retargetPr } = require( './github' );

const pullsExist = ( pulls ) => ( ( pulls && pulls.length ) || 0 ) > 0;

async function retargetOpenPrs(
	repoOwner,
	repoName,
	from,
	to,
	accessToken,
	{ dry, waitForRateLimit }
) {
	const octokit = new Octokit( { auth: accessToken } );

	let pulls = await getPulls( octokit, repoOwner, repoName, from );

	// We loop until there are no more pull requests to work on or we hit the rate limit
	while ( pullsExist( pulls ) ) {
		console.log( `Found ${ pulls.length } more pull requests to retarget.` );

		if ( dry ) {
			console.log( 'Exiting dry run without changes.' );
			return;
		}

		for ( const pull of pulls ) {
			try {
				const rateLimitInfo = await retargetPr( octokit, repoOwner, repoName, pull, to );

				if ( isHittingRateLimit( rateLimitInfo ) ) {
					if ( waitForRateLimit ) {
						await sleepUntilRateLimitOver( rateLimitInfo );
					} else {
						warnOfRateLimit( rateLimitInfo );
						return;
					}
				}
			} catch ( e ) {
				console.error( 'An unknown error occurred.' );
				console.error( String( e ) );
				return null;
			}
		}

		pulls = await getPulls( octokit, repoOwner, repoName, from );
	}

	if ( pulls === null ) {
		// We ran into an error and should exit silently. Our error handling will advise the user.
		return;
	}

	console.log( 'No more pull requests found for the specified base branch.' );
}

module.exports = retargetOpenPrs;
