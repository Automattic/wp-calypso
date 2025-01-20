import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import LaunchpadPreLaunch from '../cards/launchpad/pre-launch';

import './full-screen-launchpad.scss';

export const FullScreenLaunchpad = ( { onClose }: { onClose: () => void } ) => {
	const { __ } = useI18n();

	return (
		<div css={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' } }>
			<div className="is-launchpad-first" css={ { width: '100%' } }>
				<LaunchpadPreLaunch highlightNextAction />
			</div>
			<Button onClick={ onClose }>{ __( 'Hide onboarding setup' ) }</Button>
		</div>
	);
};
