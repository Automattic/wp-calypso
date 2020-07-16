/**
 * External dependencies
 */
import { execSync } from 'child_process';

function getCurrentBranchName() {
	try {
		return execSync( 'git rev-parse --abbrev-ref HEAD' ).toString().replace( /\s/gm, '' );
	} catch ( err ) {
		return undefined;
	}
}

function getCurrentCommitShortChecksum() {
	try {
		return execSync( 'git rev-parse --short HEAD' ).toString().replace( /\s/gm, '' );
	} catch ( err ) {
		return undefined;
	}
}

export default ( req, calypsoEnv ) => {
	const context = {
		commitSha: process.env.hasOwnProperty( 'COMMIT_SHA' ) ? process.env.COMMIT_SHA : '(unknown)',
	};

	switch ( calypsoEnv ) {
		case 'wpcalypso':
			// this is for calypso.live, so that branchName can be available while rendering the page
			if ( req.query.branch ) {
				context.branchName = req.query.branch;
			}
			break;
		case 'development':
		case 'jetpack-cloud-development':
			context.branchName = getCurrentBranchName();
			context.commitChecksum = getCurrentCommitShortChecksum();
			break;
	}

	return context;
};
