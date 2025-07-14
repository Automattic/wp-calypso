import { Step } from '@automattic/onboarding';
import { ProgressBar } from '@wordpress/components';

import './one-tap-auth-loader-overlay.scss';

type Props = {
	showCompactLogo?: boolean;
};

export default function OneTapAuthLoaderOverlay( { showCompactLogo }: Props ) {
	return (
		<div className="one-tap-auth-loader-overlay">
			<Step.TopBar compactLogo={ showCompactLogo ? 'always' : undefined } />
			<ProgressBar className="one-tap-auth-loader-overlay__progress-bar" />
		</div>
	);
}
