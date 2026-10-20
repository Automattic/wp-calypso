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

import './style.scss';

export interface PreLaunchModalProps {
	siteName: string;
	siteDomain: string;
	planName: string;
	isLaunching: boolean;
	/** Says "Publish" instead of "Launch", for the site launch copy experiment. */
	usePublishCopy?: boolean;
	preview?: ReactNode;
	onLaunch: () => void;
	onClose: () => void;
}

export default function PreLaunchModal( {
	siteName,
	siteDomain,
	planName,
	isLaunching,
	usePublishCopy = false,
	preview,
	onLaunch,
	onClose,
}: PreLaunchModalProps ) {
	// Each __() is its own unconditional call: terser folds `cond ? __( a ) : __( b )` into
	// `__( cond ? a : b )`, which breaks i18n-check-webpack-plugin in Jetpack's production build.
	const launchingTitle = __( 'Launching site…' );
	const readyTitle = __( 'Launching makes your site public' );
	const launchDescription = __(
		'Share your work, connect with your audience, and take the next step toward your goals. Do you want to launch?'
	);
	const launchButtonLabel = __( 'Yes, launch site!' );
	const publishingTitle = __( 'Publishing site…' );
	const publishReadyTitle = __( 'Publishing makes your site public' );
	const publishDescription = __(
		'Share your work, connect with your audience, and take the next step toward your goals. Do you want to publish your site?'
	);
	const publishButtonLabel = __( 'Yes, publish site!' );

	const busyTitle = usePublishCopy ? publishingTitle : launchingTitle;
	const confirmTitle = usePublishCopy ? publishReadyTitle : readyTitle;

	return (
		<Modal
			className="site-launch-pre-launch-modal"
			title={ isLaunching ? busyTitle : confirmTitle }
			size="medium"
			onRequestClose={ onClose }
		>
			<div className="site-launch-pre-launch-modal__body" data-launching={ isLaunching }>
				<VStack
					className="site-launch-pre-launch-modal__confirmation"
					spacing={ 6 }
					aria-hidden={ isLaunching }
				>
					<Text as="p">{ usePublishCopy ? publishDescription : launchDescription }</Text>
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
							{ usePublishCopy ? publishButtonLabel : launchButtonLabel }
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
