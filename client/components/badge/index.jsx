/**
 * External dependencies
 */
import React from 'react';
import { execSync } from 'child_process';

/**
 * Internal dependencies
 */
import config from 'config';

let badge = false, devDocs, feedbackUrl;

if ( config( 'env' ) === 'wpcalypso' ) {
	badge = config( 'env' );
	devDocs = true;
	feedbackUrl = 'https://github.com/Automattic/wp-calypso/issues/';
}

if ( config( 'env' ) === 'horizon' ) {
	badge = 'feedback';
	feedbackUrl = 'https://horizonfeedback.wordpress.com/';
}

if ( config( 'env' ) === 'stage' ) {
	badge = 'staging';
	feedbackUrl = 'https://github.com/Automattic/wp-calypso/issues/';
}

if ( config( 'env' ) === 'development' ) {
	badge = 'dev';
	devDocs = true;
	feedbackUrl = 'https://github.com/Automattic/wp-calypso/issues/';
}

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

const BranchName = () => {
	const branchName = getCurrentBranchName();
	if ( branchName === 'master' ) {
		return null;
	}

	return (
		<span className={ 'environment branch-name' } title={ 'Commit ' + getCurrentCommitShortChecksum() }>
			{ branchName }
		</span>
	);
};

const DevDocsLink = ( { devDocsUrl } ) => (
	<span className="environment is-docs">
		<a href={ devDocsUrl } title="DevDocs">
			docs
		</a>
	</span>
);

const Badge = () => {
	if ( ! badge ) {
		return null;
	}

	return (
		<div className="environment-badge">
			{ config.isEnabled( 'dev/test-helper' ) && <div className="environment is-tests" /> }
			{ config( 'env' ) === 'development' && <BranchName /> }
			{ devDocs && <DevDocsLink devDocsUrl={ '/devdocs' } /> }
			<span className={ 'environment is-' + badge }>
				{ badge }
			</span>
			<a href={ feedbackUrl } title="Report an issue" target="_blank" rel="noopener noreferrer" className="bug-report" />
		</div>
	);
};

export default Badge;
