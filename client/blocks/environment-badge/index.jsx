/** @format */
/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import Gridicon from 'gridicons';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import EnvironmentBadge, {
	TestHelper,
	Branch,
	DevDocsLink,
	PreferencesHelper,
} from 'components/environment-badge';

const environmentProps = get(
	{
		wpcalypso: {
			badge: 'wpcalypso',
			devDocs: true,
			feedbackURL: 'https://github.com/Automattic/wp-calypso/issues/',
		},

		horizon: {
			badge: 'feedback',
			feedbackURL: 'https://horizonfeedback.wordpress.com/',
		},

		stage: {
			badge: 'staging',
			feedbackURL: 'https://github.com/Automattic/wp-calypso/issues/',
		},

		development: {
			badge: 'dev',
			devDocs: true,
			feedbackURL: 'https://github.com/Automattic/wp-calypso/issues/',
		},
	},
	config( 'env_id' ),
	{}
);

const devDocsURL = '/devdocs';

// TODO: Rename classnames to be inline with lint rules
/* eslint-disable wpcalypso/jsx-classname-namespace */
export const Badge = () => {
	const abTestHelper = config.isEnabled( 'dev/test-helper' );
	const preferencesHelper = config.isEnabled( 'dev/preferences-helper' );
	const { badge, devDocs, feedbackURL } = environmentProps;
	const { branchName, commitChecksum } = window;

	if ( ! badge ) {
		return null;
	}

	return config.isEnabled( 'desktop' ) ? (
		<EnvironmentBadge badge={ badge } feedbackURL={ feedbackURL }>
			{ preferencesHelper && <PreferencesHelper /> }
			{ abTestHelper && <TestHelper /> }
			{ branchName && <Branch branchName={ branchName } commitChecksum={ commitChecksum } /> }
			{ devDocs && <DevDocsLink url={ devDocsURL } /> }
		</EnvironmentBadge>
	) : (
		<div className="environment-badge">
			{ abTestHelper && <div className="environment is-tests" /> }
			{ branchName &&
				branchName !== 'master' && (
					<span className="environment branch-name" title={ 'Commit ' + commitChecksum }>
						{ branchName }
					</span>
				) }
			{ devDocs && (
				<span className="environment is-docs">
					<a href={ devDocsURL } title="DevDocs">
						docs
					</a>
				</span>
			) }
			<span className={ `environment is-${ badge } is-env` }>{ badge }</span>
			<ExternalLink
				className="bug-report"
				href={ feedbackURL }
				target="_blank"
				title="Report an issue"
			>
				<Gridicon icon="bug" size={ 18 } />
			</ExternalLink>
		</div>
	);
};

export default Badge;
