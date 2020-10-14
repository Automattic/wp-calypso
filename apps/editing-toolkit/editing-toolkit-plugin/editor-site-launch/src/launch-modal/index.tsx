/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { EntityProvider } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';
import { Icon, wordpress, close } from '@wordpress/icons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';
import Launch from '../launch';
import LaunchSidebar from '../launch-sidebar';
import LaunchProgress from '../launch-progress';
import { useSite } from '../hooks';

import './styles.scss';

interface Props {
	onClose: () => void;
}

const CloseButton = ( { onClick } ) => {
	return (
		<Button
			isLink
			className="nux-launch-modal__close-button"
			onClick={ onClick }
			aria-label={ __( 'Close dialog', 'full-site-editing' ) }
			disabled={ ! onClick }
		>
			<Icon icon={ close } size={ 24 } />
		</Button>
	);
};

const LaunchModal: React.FunctionComponent< Props > = ( { onClose } ) => {
	const { step: currentStep, isSidebarFullscreen } = useSelect( ( select ) =>
		select( LAUNCH_STORE ).getState()
	);
	const { launchSite } = useDispatch( LAUNCH_STORE );

	const [ isLaunching, setIsLaunching ] = React.useState( false );

	const { isPaidPlan } = useSite();

	const handleLaunch = () => {
		setIsLaunching( true );
		launchSite();
	};

	if ( isPaidPlan && ! isLaunching ) {
		handleLaunch();
	}

	return (
		<Modal
			open={ true }
			className={ classnames(
				'nux-launch-modal',
				`step-${ currentStep }`,
				isSidebarFullscreen ? 'is-sidebar-fullscreen' : ''
			) }
			overlayClassName="nux-launch-modal-overlay"
			bodyOpenClassName="has-nux-launch-modal"
			onRequestClose={ onClose }
			title=""
		>
			{ isLaunching ? (
				<div className="nux-launch-modal-body__launching">
					{ __( 'Hooray! Your site will be ready shortly.', 'full-site-editing' ) }
				</div>
			) : (
				<>
					<div className="nux-launch-modal-body">
						<div className="nux-launch-modal-header">
							<div className="nux-launch-modal-header__wp-logo">
								<Icon icon={ wordpress } size={ 36 } />
							</div>
							<LaunchProgress />
						</div>
						<EntityProvider kind="root" type="site">
							<Launch onSubmit={ handleLaunch } />
						</EntityProvider>
					</div>
					<div className="nux-launch-modal-aside">
						<CloseButton onClick={ onClose } />
						<LaunchSidebar />
					</div>
				</>
			) }
		</Modal>
	);
};

export default LaunchModal;
