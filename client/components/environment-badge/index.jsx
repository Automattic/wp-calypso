import { Gridicon } from '@automattic/components';
import { string, node } from 'prop-types';
import ExternalLink from 'calypso/components/external-link';

import './style.scss';

export function ReactQueryDevtoolsHelper() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return <div className="environment is-react-query-devtools" />;
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export function AccountSettingsHelper() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return <div className="environment is-account-settings" />;
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export function PreferencesHelper() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return <div className="environment is-prefs" />;
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export function FeaturesHelper() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return <div className="environment is-features" />;
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export function AuthHelper() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return <div className="environment is-auth" />;
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export function Branch( { branchName, commitChecksum } ) {
	return branchName === 'trunk' ? null : (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<span className="environment branch-name" title={ 'Commit ' + commitChecksum }>
			{ branchName }
		</span>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
}

export function DevDocsLink( { url } ) {
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<span className="environment is-docs">
			<a href={ url } title="DevDocs">
				docs
			</a>
		</span>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
}

function EnvironmentBadge( { badge, feedbackURL, children } ) {
	return (
		<div className="environment-badge">
			{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
			{ children }
			<span className={ `environment is-${ badge } is-env` }>{ badge }</span>
			<ExternalLink
				className="bug-report"
				href={ feedbackURL }
				title="Report an issue"
				target="_blank"
			>
				<Gridicon icon="bug" size={ 18 } />
			</ExternalLink>
			{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
		</div>
	);
}

EnvironmentBadge.propTypes = {
	badge: string.isRequired,
	feedbackURL: string.isRequired,
	children: node,
};

export default EnvironmentBadge;
