/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { Title, SubTitle, ActionButtons, NextButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import LaunchMenu from '../launch-menu';
import { LAUNCH_STORE } from '../stores';

import './styles.scss';

const LaunchSidebar: React.FunctionComponent = () => {
	const { setStep, unsetSidebarFullscreen } = useDispatch( LAUNCH_STORE );

	const LaunchSequence = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchSequence() );

	const handleStart = () => {
		setStep( LaunchSequence[ 0 ] );
		unsetSidebarFullscreen();
	};

	const handleMenuItemClick = () => {
		unsetSidebarFullscreen();
	};

	return (
		<div className="nux-launch-sidebar">
			<div className="nux-launch-sidebar__header">
				<Title>{ __( "You're almost there2!", 'full-site-editing' ) }</Title>
				<SubTitle>
					<div>This is my subtitle.</div>
					{ __(
						'Complete the following steps to launch your site. Your site will remain private until you Launch.',
						'full-site-editing'
					) }
				</SubTitle>
			</div>
			<div>Just test whatever.</div>
			<div className="nux-launch-sidebar__body">
				<LaunchMenu onMenuItemClick={ handleMenuItemClick } />
			</div>
			<div className="nux-launch-sidebar__footer">
				<ActionButtons sticky={ true }>
					<NextButton onClick={ handleStart }>
						{ __( 'Get Started', 'full-site-editing' ) }
					</NextButton>
				</ActionButtons>
			</div>
		</div>
	);
};

export default LaunchSidebar;
