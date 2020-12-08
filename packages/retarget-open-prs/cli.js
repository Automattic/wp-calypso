#!/usr/bin/env node
const yargs = require( 'yargs' );
const retargetOpenPrs = require( './index' );

const args = yargs
	.usage( 'Usage: $0' )
	.options( {
		owner: {
			alias: 'o',
			describe: 'The owner of the repository (either a user or organization).',
			demandOption: true,
			requiresArg: true,
		},
		repo: {
			alias: 'r',
			describe: 'The full name of the repository in which to retarget PRs.',
			demandOption: true,
			requiresArg: true,
		},
		from: {
			alias: 'f',
			describe:
				'The original branch name against which to select open PRs that need to be retargeted.',
			demandOption: true,
			requiresArg: true,
		},
		to: {
			alias: 't',
			describe:
				'The new branch towards which to retarget PRs open against "from". Defaults to the default branch of the repository.',
		},
		'access-token': {
			describe:
				'A GitHub access token authorized to retarget open PRs in the repository named in "repo"',
			demandOption: true,
			requiresArg: true,
		},
		dry: {
			alias: 'd',
			describe:
				'Run the command without making any changes, outputting the number of PRs that would be affected.',
		},
		'wait-for-rate-limit': {
			alias: 'w',
			describe:
				'When true, this will wait for the rate limit reset rather than exiting after hitting the rate limit',
		},
	} )
	.example(
		'$0 --owner=Automattic --repo=wp-calypso --from="main" --to="trunk" --access-token="ABCDEFG1234567"'
	)
	.help( 'h' )
	.alias( 'h', 'help' ).argv;

retargetOpenPrs( args.owner, args.repo, args.from, args.to, args[ 'access-token' ], {
	dry: args.dry,
	waitForRateLimit: args[ 'wait-for-rate-limit' ],
} );
