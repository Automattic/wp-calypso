/* global launchBarUserData */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import './wpcom-global-styles-view.scss';

function recordEvent( button ) {
	recordTracksEvent( 'wpcom_launchbar_button_click', {
		button,
		blog_id: launchBarUserData?.blogId,
	} );
}

( function () {
	const popoverToggle = document.querySelector( '.launch-bar-global-styles-toggle' );
	const popover = document.querySelector( '.launch-bar-global-styles-popover' );
	const upgradeButton = document.querySelector( '.launch-bar-global-styles-upgrade-button' );
	const previewButton = document.querySelector( '.launch-bar-global-styles-preview-link' );

	popoverToggle?.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		recordEvent( 'wpcom_global_styles_gating_notice' );
		popover?.classList.toggle( 'hidden' );
	} );

	upgradeButton?.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		recordEvent( 'wpcom_global_styles_gating_notice_upgrade' );
		window.location = upgradeButton.href;
	} );

	previewButton?.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		recordEvent( 'wpcom_global_styles_gating_notice_preview' );
		window.location = previewButton.href;
	} );
} )();
