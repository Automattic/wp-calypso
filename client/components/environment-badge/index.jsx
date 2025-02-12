import { Gridicon, ExternalLink } from '@automattic/components';
import { node, string } from 'prop-types';

import './style.scss';

export function ReactQueryDevtoolsHelper() {
	return <div className="environment is-react-query-devtools" />;
}

export function AccountSettingsHelper() {
	return <div className="environment is-account-settings" />;
}

export function PreferencesHelper() {
	return <div className="environment is-prefs" />;
}

export function FeaturesHelper() {
	return <div className="environment is-features" />;
}

export function AuthHelper() {
	return <div className="environment is-auth" />;
}

export function StoreSandboxHelper() {
	return <div className="environment is-store-sandbox" />;
}

export function Branch( { branchName, commitChecksum } ) {
	return branchName === 'trunk' ? null : (
		<span className="environment branch-name" title={ 'Commit ' + commitChecksum }>
			{ branchName }
		</span>
	);
}

export function DevDocsLink( { url } ) {
	return (
		<span className="environment is-docs">
			<a href={ url } title="DevDocs">
				docs
			</a>
		</span>
	);
}

function EnvironmentBadge( { badge, feedbackURL, children } ) {
	// Static HTML only is produced here. Event listeners get added in
	// load-dev-helpers/index.js
	return (
		<div className="environment-badge">
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
		</div>
	);
}

EnvironmentBadge.propTypes = {
	badge: string.isRequired,
	feedbackURL: string.isRequired,
	children: node,
};

export default EnvironmentBadge;
