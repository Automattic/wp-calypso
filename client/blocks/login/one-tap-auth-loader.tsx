import { ProgressBar } from '@wordpress/components';

import './one-tap-auth-loader.scss';

export default function OneTapAuthLoader() {
	return (
		<div className="one-tap-auth-loader">
			<ProgressBar className="one-tap-auth-loader__progress-bar" />
		</div>
	);
}
