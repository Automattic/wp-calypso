/* global calypsoifyGutenberg */

/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
/* eslint-disable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import './launch-button-override.scss';

domReady( () => {
	// Ensure settings bar is rendered before proceeding.
	const awaitSettingsBar = setInterval( () => {
		const settingsBar = document.querySelector( '.edit-post-header__settings' );
		if ( ! settingsBar ) {
			return;
		}
		clearInterval( awaitSettingsBar );

		updateButtonBar( settingsBar );
		// Hook fallback incase updateLaunchButton data is set after initial dom render.
		window.wp.hooks.addAction( 'updateLaunchButton', 'a8c-gutenboarding', isGutenboarding => {
			if ( isGutenboarding ) {
				updateButtonBar( settingsBar );
			}
		} );
	} );
} );

function updateButtonBar( settingsBar ) {
	const hideClass = 'launch-button-override__hidden';
	if ( calypsoifyGutenberg.hasLaunchButton ) {
		// Hide 'switch to draft' by '.editor-post-switch-to-draft'.
		const switchToDraft = settingsBar.querySelector( '.editor-post-switch-to-draft' );
		switchToDraft && switchToDraft.classList.add( hideClass );

		// Hide 'preview' by '.editor-post-preview'
		// This is not initially added, we may need to wait for it.
		const awaitPreview = setInterval( () => {
			const preview = settingsBar.querySelector( '.editor-post-preview' );
			if ( ! preview ) {
				return;
			}
			clearInterval( awaitPreview );
			preview.classList.add( 'launch-button-override__hidden' );
		} );

		// 'Update'/'Publish' primary button to become 'Save' tertiary button.
		const publish = settingsBar.querySelector( '.editor-post-publish-button' );
		if ( publish ) {
			publish.classList.remove( 'is-primary' );
			publish.classList.add( 'is-tertiary' );
			publish.innerText = __( 'Save' );
		}
		// 'Launch' button to replace update button
		const launchButton = document.createElement( 'button' );
		launchButton.className = 'launch-button-override__launch-button components-button is-primary';
		launchButton.innerText = __( 'Launch' );
		// TODO - Launch goto /frankenflow
		settingsBar.prepend( launchButton );
		settingsBar.prepend( publish );
	}
}
