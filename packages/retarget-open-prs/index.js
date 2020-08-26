const { Octokit } = require( '@octokit/core' );

async function retargetOpenPrs( repoOwner, repoName, from, to, accessToken ) {
	const octokit = new Octokit( { auth: accessToken } );

	const { data: pulls } = await octokit.request( 'GET /repos/{owner}/{repo}/pulls', {
		owner: repoOwner,
		repo: repoName,
		base: from,
	} );

	for ( const pull of pulls ) {
		await octokit.request( 'PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
			owner: repoOwner,
			repo: repoName,
			pull_number: pull.number,
			base: to,
		} );
	}
}

module.exports = retargetOpenPrs;
