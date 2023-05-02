/* global launchBarUserData */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import './wpcom-global-styles-view.scss';

function recordEvent( button, props = {} ) {
	recordTracksEvent( 'wpcom_launchbar_button_click', {
		button,
		blog_id: launchBarUserData?.blogId,
		...props,
	} );
}

document.addEventListener( 'DOMContentLoaded', () => {
	let container;
	if ( launchBarUserData?.isAtomic ) {
		const isShadowDOM = !! ( document.head.attachShadow || document.head.createShadowRoot );
		if ( isShadowDOM ) {
			container = document.querySelector( '#wpcom-launch-banner-wrapper' ).shadowRoot;
		} else {
			container = document.querySelector( '#wpcom-launch-banner-wrapper' );
		}
	} else {
		container = document;
	}
	const popoverToggle = container.querySelector( '.launch-bar-global-styles-toggle' );
	const popover = container.querySelector( '.launch-bar-global-styles-popover' );
	const upgradeButton = container.querySelector( '.launch-bar-global-styles-upgrade' );
	const previewButton = container.querySelector( '.launch-bar-global-styles-preview' );

	if ( ! popover?.classList.contains( 'hidden' ) ) {
		recordEvent( 'wpcom_global_styles_gating_notice', {
			action: 'show',
		} );
	}

	popoverToggle?.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		recordEvent( 'wpcom_global_styles_gating_notice', {
			action: popover?.classList.contains( 'hidden' ) ? 'show' : 'hide',
		} );
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
} );
