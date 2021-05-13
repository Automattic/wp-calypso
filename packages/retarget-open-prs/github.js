/* eslint-disable no-console */

async function getPulls( octokit, repoOwner, repoName, base ) {
	try {
		const { data: pulls } = await octokit.request( 'GET /repos/{owner}/{repo}/pulls', {
			owner: repoOwner,
			repo: repoName,
			base,
			per_page: 100,
			state: 'open',
		} );
		return pulls;
	} catch ( e ) {
		if ( e.status === 404 ) {
			console.error( 'Unable to find the repository. Please check `owner` and `repo` arguments.' );
		} else {
			console.error( 'An unknown error occurred.' );
			console.error( String( e ) );
		}

		return null;
	}
}

async function retargetPr( octokit, repoOwner, repoName, pull, to ) {
	const {
		headers: { 'x-ratelimit-remaining': remainingRateLimit, 'x-ratelimit-reset': rateLimitReset },
	} = await octokit.request( 'PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
		owner: repoOwner,
		repo: repoName,
		pull_number: pull.number,
		base: to,
	} );

	return { remainingRateLimit, rateLimitReset };
}

module.exports = {
	getPulls,
	retargetPr,
};
