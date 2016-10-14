/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { execSync } from 'child_process';

/**
 * Internal dependencies
 */
import config from 'config';

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

export const BranchName = () => {
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

export const DevDocsLink = () => (
	<span className="environment is-docs">
		<a href="/devdocs" title="DevDocs">
			docs
		</a>
	</span>
);

export class BadgeBase extends React.Component {
	componentWillMount() {
		const { env } = this.props;

		this.badge = false;
		this.devDocs = false;
		this.feedbackUrl = false;

		if ( env === 'wpcalypso' ) {
			this.badge = env;
			this.devDocs = true;
			this.feedbackUrl = 'https://github.com/Automattic/wp-calypso/issues/';
		}

		if ( env === 'horizon' ) {
			this.badge = 'feedback';
			this.feedbackUrl = 'https://horizonfeedback.wordpress.com/';
		}

		if ( env === 'stage' ) {
			this.badge = 'staging';
			this.feedbackUrl = 'https://github.com/Automattic/wp-calypso/issues/';
		}

		if ( env === 'development' ) {
			this.badge = 'dev';
			this.devDocs = true;
			this.feedbackUrl = 'https://github.com/Automattic/wp-calypso/issues/';
		}
	}

	render() {
		const { env, testHelper } = this.props;

		if ( ! this.badge ) {
			return null;
		}

		return (
			<div className="environment-badge">
				{ testHelper && <div className="environment is-tests" /> }
				{ env === 'development' && <BranchName /> }
				{ this.devDocs && <DevDocsLink /> }
				<span className={ 'environment is-' + this.badge }>
					{ this.badge }
				</span>
				<a href={ this.feedbackUrl } title="Report an issue" target="_blank" rel="noopener noreferrer" className="bug-report" />
			</div>
		);
	}
}

BadgeBase.propTypes = {
	env: PropTypes.string.isRequired,
	testHelper: PropTypes.bool
};

BadgeBase.defaultProps = {
	testHelper: false
};

const Badge = () => (
	<BadgeBase env={ config( 'env' ) } testHelper={ config.isEnabled( 'dev/test-helper' ) } />
);

export default Badge;
