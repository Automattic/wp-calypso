import {
	Button,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useDashboardOptIn from 'calypso/a8c-for-agencies/hooks/use-dashboard-opt-in';
import newDashboardDrawing from 'calypso/dashboard/agency/dashboard-opt-in/images/new-dashboard.svg';
// eslint-disable-next-line no-restricted-imports -- reuses the new dashboard's tour glow as is.
import glow from 'calypso/dashboard/agency/onboarding-tour/images/tour/glow.jpg';

import './style.scss';

type Props = {
	onClose: () => void;
	// Where the modal was opened from.
	source: 'overview' | 'helpful-links' | 'profile-menu';
};

/**
 * Introduces the new dashboard and moves the agency there in one step.
 */
export default function DashboardOptInModal( { onClose }: Props ) {
	const { optIn, isPending } = useDashboardOptIn();

	return (
		<Modal
			className="a4a-dashboard-opt-in-intro"
			size="medium"
			onRequestClose={ isPending ? () => {} : onClose }
			__experimentalHideHeader
		>
			<div
				className="a4a-dashboard-opt-in-intro-field"
				style={ { backgroundImage: `url(${ glow })` } }
			>
				<img className="a4a-dashboard-opt-in-intro-drawing" src={ newDashboardDrawing } alt="" />
			</div>
			<VStack spacing={ 8 }>
				<VStack spacing={ 2 }>
					<Heading level={ 2 } size={ 20 } weight={ 600 }>
						{ __( 'Try the new dashboard' ) }
					</Heading>
					<Text>
						{ __(
							'Manage your sites, purchases, and earnings in one place. Your whole team moves with you, and you can switch back at any time from Agency\u00a0>\u00a0Dashboard.'
						) }
					</Text>
				</VStack>
				<HStack justify="flex-end" spacing={ 3 }>
					<Button
						variant="tertiary"
						onClick={ onClose }
						disabled={ isPending }
						__next40pxDefaultSize
					>
						{ __( 'Not now' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ optIn }
						isBusy={ isPending }
						disabled={ isPending }
						__next40pxDefaultSize
					>
						{ __( 'Switch to the new dashboard' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
