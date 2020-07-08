/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import LaunchModal from '../launch-modal';
import { LAUNCH_STORE } from '../stores';
import { useSite, useOnLaunch } from '../hooks';

import './styles.scss';

const LaunchButton: React.FunctionComponent = () => {
	const { launchSite } = useDispatch( LAUNCH_STORE );
	const { isSiteUnlaunched, isFreePlan } = useSite();
	const [ isLaunchModalVisible, setLaunchModalVisibility ] = React.useState( false );
	const [ isLaunching, setIsLaunching ] = React.useState( false );

	const handleLaunch = () => {
		setIsLaunching( true );
		launchSite();
	};

	const handleModalClose = () => {
		setLaunchModalVisibility( false );
	};

	const handleClick = () => {
		isFreePlan ? setLaunchModalVisibility( ! isLaunchModalVisible ) : handleLaunch();
	};

	// adding the hook to handle redirects after launch to the root component which is always mounted until we launch
	useOnLaunch();

	return (
		<>
			{ isSiteUnlaunched && (
				<Button
					aria-expanded={ isLaunchModalVisible }
					aria-pressed={ isLaunchModalVisible }
					aria-haspopup="menu"
					onClick={ handleClick }
				>
					{ __( 'Launch site', 'full-site-editing' ) }
				</Button>
			) }
			{ isLaunchModalVisible && (
				<LaunchModal
					onClose={ handleModalClose }
					onSubmit={ handleLaunch }
					isLaunching={ isLaunching }
				/>
			) }
			{ isLaunching && <LaunchModal isLaunching /> }
		</>
	);
};

export default LaunchButton;
