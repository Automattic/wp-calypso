/* eslint-disable no-console */

const { Octokit } = require( '@octokit/core' );
const { isHittingRateLimit, warnOfRateLimit } = require( './rate-limit' );

async function getPulls( octokit, repoOwner, repoName, base ) {
	try {
		const { data: pulls } = await octokit.request( 'GET /repos/{owner}/{repo}/pulls', {
			owner: repoOwner,
			repo: repoName,
			base,
			per_page: 100,
		} );
		return pulls;
	} catch ( e ) {
		if ( e.status === 404 ) {
			console.error( 'Unable to find the repository. Please check `owner` and `repo` arguments.' );
		} else {
			console.error( 'An unknown error occurred.' );
			console.error( e );
		}

		return null;
	}
}

async function updatePullRequestBaseBranch( octokit, repoOwner, repoName, pull, to ) {
	try {
		const {
			headers: { 'x-ratelimit-remaining': remainingRateLimit, 'x-ratelimit-reset': rateLimitReset },
		} = await octokit.request( 'PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
			owner: repoOwner,
			repo: repoName,
			pull_number: pull.number,
			base: to,
		} );

		return { remainingRateLimit, rateLimitReset };
	} catch ( e ) {}
}

async function retargetOpenPrs( repoOwner, repoName, from, to, accessToken, { dry } ) {
	const octokit = new Octokit( { auth: accessToken } );

	let pulls = await getPulls( octokit, repoOwner, repoName, from );

	// eslint-disable-next-line no-constant-condition
	while ( ( ( pulls && pulls.length ) || 0 ) > 0 ) {
		// We loop until there are no more pull requests to work on or we hit the rate limit
		console.log( `Found ${ pulls.length } pull requests to retarget.` );

		if ( dry ) {
			console.log( 'Exiting dry run without changes.' );
			return;
		}

		for ( const pull of pulls ) {
			const rateLimitInfo = await updatePullRequestBaseBranch(
				octokit,
				repoOwner,
				repoName,
				pull,
				to
			);

			if ( isHittingRateLimit( rateLimitInfo ) ) {
				warnOfRateLimit( rateLimitInfo );
				pulls = null;
				return;
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
