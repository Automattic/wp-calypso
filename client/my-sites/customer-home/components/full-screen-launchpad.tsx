import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import LaunchpadPreLaunch from '../cards/launchpad/pre-launch';

export const FullScreenLaunchpad = ( { onClose }: { onClose: () => void } ) => {
	const { __ } = useI18n();

	return (
		<div css={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' } }>
			<div css={ { width: '100%' } }>
				<LaunchpadPreLaunch />
			</div>
			<Button onClick={ onClose }>{ __( 'Hide onboarding setup' ) }</Button>
		</div>
	);
};
