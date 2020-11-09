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
import { useSite } from '../hooks';

import './styles.scss';

interface Props {
	onClose: () => void;
}

const LaunchModal: React.FunctionComponent< Props > = ( { onClose } ) => {
	const { step: currentStep } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
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
			className={ classnames( 'nux-launch-modal', `step-${ currentStep }` ) }
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
					<div className="nux-launch-modal-header">
						<div className="nux-launch-modal-header__wp-logo">
							<Icon icon={ wordpress } size={ 36 } />
						</div>
					</div>
					<div className="nux-launch-modal-body">
						<EntityProvider kind="root" type="site">
							<Launch onSubmit={ handleLaunch } />
						</EntityProvider>
					</div>
					<div className="nux-launch-modal-aside">
						<Button
							isLink
							className="nux-launch-modal__close-button"
							onClick={ onClose }
							aria-label={ __( 'Close dialog', 'full-site-editing' ) }
							disabled={ ! onClose }
						>
							<Icon icon={ close } size={ 24 } />
						</Button>
						<LaunchSidebar />
					</div>
				</>
			) }
		</Modal>
	);
};

export default LaunchModal;
