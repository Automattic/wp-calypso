import { Step } from '@automattic/onboarding';

import './one-tap-auth-loader-overlay.scss';

type Props = {
	showCompactLogo?: boolean;
};

export default function OneTapAuthLoaderOverlay( { showCompactLogo }: Props ) {
	return (
		<div className="one-tap-auth-loader-overlay">
			<Step.Loading compactLogo={ showCompactLogo ? 'always' : undefined } />
		</div>
	);
}
