import { Step } from '@automattic/onboarding';
import { ProgressBar } from '@wordpress/components';

import './one-tap-auth-loader-overlay.scss';

export default function OneTapAuthLoaderOverlay() {
	return (
		<div className="one-tap-auth-loader-overlay">
			<Step.TopBar compactLogo />
			<ProgressBar className="one-tap-auth-loader-overlay__progress-bar" />
		</div>
	);
}
