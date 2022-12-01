/* global launchBarUserData */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import './wpcom-global-styles-view.scss';

( function () {
	const popoverToggle = document.querySelector( '.launch-bar-global-styles-toggle' );
	const popover = document.querySelector( '.launch-bar-global-styles-popover' );
	const upgradeButton = document.querySelector( '.launch-bar-global-styles-upgrade-button' );

	popoverToggle?.addEventListener( 'click', ( event ) => {
		event.preventDefault();

		recordTracksEvent( 'wpcom_launchbar_button_click', {
			button: 'wpcom_global_styles_gating_notice',
			blog_id: launchBarUserData?.blogId,
		} );

		popover?.classList.toggle( 'hidden' );
	} );

	upgradeButton?.addEventListener( 'click', ( event ) => {
		event.preventDefault();

		recordTracksEvent( 'wpcom_launchbar_button_click', {
			button: 'wpcom_global_styles_gating_notice_upgrade',
			blog_id: launchBarUserData?.blogId,
		} );

		window.location = upgradeButton.href;
	} );
} )();
