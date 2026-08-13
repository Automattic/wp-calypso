import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Icon,
	Modal,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe, payment } from '@wordpress/icons';
import type { ReactNode } from 'react';

interface PreLaunchModalProps {
	siteName: string;
	siteDomain: string;
	planName: string;
	isLaunching: boolean;
	preview?: ReactNode;
	onLaunch: () => void;
	onClose: () => void;
}

export default function PreLaunchModal( {
	siteName,
	siteDomain,
	planName,
	isLaunching,
	preview,
	onLaunch,
	onClose,
}: PreLaunchModalProps ) {
	return (
		<Modal
			className="site-launch-pre-launch-modal"
			title={ isLaunching ? __( 'Launching site…' ) : __( 'Launching makes your site public' ) }
			size="medium"
			onRequestClose={ onClose }
		>
			<div className="site-launch-pre-launch-modal__body" data-launching={ isLaunching }>
				<VStack
					className="site-launch-pre-launch-modal__confirmation"
					spacing={ 6 }
					aria-hidden={ isLaunching }
				>
					<Text as="p">
						{ __(
							'Share your work, connect with your audience, and take the next step toward your goals. Do you want to launch?'
						) }
					</Text>
					<HStack
						className="site-launch-pre-launch-modal__preview-card"
						spacing={ 4 }
						alignment="center"
						justify="flex-start"
					>
						{ preview }
						<VStack spacing={ 1 } className="site-launch-pre-launch-modal__meta">
							<Text size={ 16 } weight={ 400 } truncate>
								{ siteName }
							</Text>
							<HStack spacing={ 2 } justify="flex-start" alignment="center">
								<Icon icon={ globe } size={ 20 } />
								<Text truncate>{ siteDomain }</Text>
							</HStack>
							<HStack spacing={ 2 } justify="flex-start" alignment="center">
								<Icon icon={ payment } size={ 20 } />
								<Text truncate>{ planName }</Text>
							</HStack>
						</VStack>
					</HStack>
					<HStack justify="flex-end">
						<Button variant="primary" onClick={ onLaunch }>
							{ __( 'Yes, launch site!' ) }
						</Button>
					</HStack>
				</VStack>
				{ isLaunching && (
					<div className="site-launch-pre-launch-modal__spinner">
						<Spinner />
					</div>
				) }
			</div>
		</Modal>
	);
}
