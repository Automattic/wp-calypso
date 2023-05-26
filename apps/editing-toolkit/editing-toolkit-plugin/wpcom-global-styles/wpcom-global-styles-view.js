/* global launchBarUserData, localStorage */
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
	const closeButton = container.querySelector( '.launch-bar-global-styles-close' );

	const limitedGlobalStylesNoticeAction =
		localStorage.getItem( 'limitedGlobalStylesNoticeAction' ) ?? 'show';
	if ( limitedGlobalStylesNoticeAction === 'show' ) {
		popover?.classList.remove( 'hidden' );
		recordEvent( 'wpcom_global_styles_gating_notice', { action: 'show' } );
	}

	popoverToggle?.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		const action = popover?.classList.contains( 'hidden' ) ? 'show' : 'hide';
		recordEvent( 'wpcom_global_styles_gating_notice', { action } );
		localStorage.setItem( 'limitedGlobalStylesNoticeAction', action );
		popover?.classList.toggle( 'hidden' );
	} );

	closeButton?.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		recordEvent( 'wpcom_global_styles_gating_notice', { action: 'hide' } );
		localStorage.setItem( 'limitedGlobalStylesNoticeAction', 'hide' );
		popover?.classList.add( 'hidden' );
	} );

	upgradeButton?.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		recordEvent( 'wpcom_global_styles_gating_notice_upgrade' );
		window.location = upgradeButton.href;
	} );

	previewButton?.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		const checkbox = previewButton.querySelector( 'input[type="checkbox"]' );
		if ( checkbox ) {
			checkbox.checked = ! checkbox.checked;
		}
		recordEvent( 'wpcom_global_styles_gating_notice_preview', {
			action: checkbox.checked ? 'show' : 'hide',
		} );
		window.location = previewButton.href;
	} );
} );
