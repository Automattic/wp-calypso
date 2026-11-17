import { Icon } from '@wordpress/components';
import { bug, cloud, shield } from '@wordpress/icons';
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

export function BlackboxHelper() {
	return <div className="environment is-blackbox" />;
}

export function Branch( { branchName, commitChecksum } ) {
	return branchName === 'trunk' ? null : (
		<span className="environment branch-name" title={ 'Commit ' + commitChecksum }>
			{ branchName }
		</span>
	);
}

function getBadgeIcon( badge ) {
	if ( badge === 'dev' || badge.endsWith( '-dev' ) ) {
		return bug;
	}
	if ( badge === 'staging' || badge.endsWith( '-staging' ) ) {
		return shield;
	}
	return cloud;
}

function EnvironmentBadge( { badge, feedbackURL, children } ) {
	const icon = <Icon icon={ getBadgeIcon( badge ) } size={ 24 } />;

	// Static HTML only is produced here. Event listeners get added in
	// load-dev-helpers/index.js
	return (
		<div className="environment-badge">
			{ children }
			<span className={ `environment is-${ badge } is-env` }>{ badge }</span>
			{ feedbackURL ? (
				<a
					className="environment-badge-icon"
					href={ feedbackURL }
					title="Report an issue"
					target="_blank"
					rel="noopener noreferrer"
				>
					{ icon }
				</a>
			) : (
				<span className="environment-badge-icon">{ icon }</span>
			) }
		</div>
	);
}

EnvironmentBadge.propTypes = {
	badge: string.isRequired,
	feedbackURL: string,
	children: node,
};

export function RtlCssDisabledHelper() {
	return (
		<span
			className="environment is-rtl-css-disabled"
			title="RTL CSS is disabled. Set BUILD_RTL_CSS=true before starting Calypso to build RTL CSS."
		>
			RTLCSS off: set BUILD_RTL_CSS=true
		</span>
	);
}

export default EnvironmentBadge;
