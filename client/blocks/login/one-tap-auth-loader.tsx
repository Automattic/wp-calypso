import { Step } from '@automattic/onboarding';
import { ProgressBar } from '@wordpress/components';

import './one-tap-auth-loader.scss';

export default function OneTapAuthLoader() {
	return (
		<div className="one-tap-auth-loader">
			<Step.TopBar className="one-tap-auth-loader__top-bar" compactLogo />
			<ProgressBar className="one-tap-auth-loader__progress-bar" />
		</div>
	);
}
