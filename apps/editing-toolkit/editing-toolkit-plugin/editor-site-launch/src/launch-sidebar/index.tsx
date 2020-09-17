/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { ActionButtons, NextButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import LaunchMenu from '../launch-menu';
import { LAUNCH_STORE } from '../stores';

import './styles.scss';

const LaunchSidebar = () => {
	const { setStep, unsetSidebarFullscreen } = useDispatch( LAUNCH_STORE );

	const LaunchSequence = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchSequence() );

	const handleStart = () => {
		// TODO: Fix modal closing itself.
		setStep( LaunchSequence[ 0 ] );
		unsetSidebarFullscreen();
	};

	const handleMenuItemClick = () => {
		unsetSidebarFullscreen();
	};

	return (
		<div className="nux-launch-sidebar">
			<h2>{ __( "You're almost there!", 'full-site-editing' ) }</h2>
			<h3>
				{ __(
					'Complete the following steps to launch your site. Your site will remain private until you Launch.',
					'full-site-editing'
				) }
			</h3>
			<LaunchMenu onMenuItemClick={ handleMenuItemClick } />
			<ActionButtons stickyBreakpoint="medium">
				<NextButton onClick={ handleStart }>
					{ __( 'Get Started', 'full-site-editing' ) }
				</NextButton>
			</ActionButtons>
		</div>
	);
};

export default LaunchSidebar;
