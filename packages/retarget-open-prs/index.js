const { Octokit } = require( '@octokit/core' );

async function retargetOpenPrs( repoOwner, repoName, from, to, accessToken ) {
	const octokit = new Octokit( { auth: accessToken } );

	const { data: pulls } = await octokit.request( 'GET /repos/{owner}/{repo}/pulls', {
		owner: repoOwner,
		repo: repoName,
		base: from,
	} );

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
