/* eslint-disable no-console */

const { Octokit } = require( '@octokit/core' );

async function getPulls( octokit, repoOwner, repoName, base ) {
	try {
		const { data: pulls } = await octokit.request( 'GET /repos/{owner}/{repo}/pulls', {
			owner: repoOwner,
			repo: repoName,
			base,
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

async function retargetOpenPrs( repoOwner, repoName, from, to, accessToken, { dry } ) {
	const octokit = new Octokit( { auth: accessToken } );

	const pulls = await getPulls( octokit, repoOwner, repoName, from );

	if ( pulls === null ) {
		return;
	}

	if ( pulls.length === 0 ) {
		console.log(
			'No pull requests found for the specified base branch. Exiting without making any changes.'
		);
		return;
	}

	console.log( `Found ${ pulls.length } pull requests to retarget.` );

	if ( dry ) {
		console.log( 'Exiting dry run without changes.' );
		return;
	}

	for ( const pull of pulls ) {
		const {
			headers: { 'x-ratelimit-remaining': remainingRateLimit, 'x-ratelimit-reset': rateLimitReset },
		} = await octokit.request( 'PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
			owner: repoOwner,
			repo: repoName,
			pull_number: pull.number,
			base: to,
		} );

		if ( remainingRateLimit === 0 ) {
			const rateLimitResetDate = new Date( rateLimitReset * 1000 );
			// eslint-disable-next-line no-console
			console.error(
				`Hit rate limit. Wait until ${ rateLimitResetDate } and then run the command again.`
			);
			return;
		}
	}
}

module.exports = retargetOpenPrs;
