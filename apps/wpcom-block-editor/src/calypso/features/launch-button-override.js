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

		calypsoifyGutenberg.isGutenboarding && updateButtonBar( settingsBar );
		// Hook fallback incase updateLaunchButton data is set after initial dom render.
		window.wp.hooks.addAction( 'updateLaunchButton', 'a8c-gutenboarding', isGutenboarding => {
			isGutenboarding && updateButtonBar( settingsBar );
		} );
	} );
} );

function updateButtonBar( settingsBar ) {
	// Add gutenboarding-editor class to body (so React re-render wont reset the added class).
	const body = document.querySelector( 'body' );
	body.classList.add( 'gutenboarding-editor' );

	// 'Update'/'Publish' primary button to become 'Save' tertiary button.
	const saveButton = settingsBar.querySelector( '.editor-post-publish-button' );
	saveButton && ( saveButton.innerText = __( 'Save' ) );

	// Create a 'Launch' button.
	const launchButton = document.createElement( 'button' );
	launchButton.className = 'launch-button-override__launch-button components-button is-primary';
	launchButton.innerText = __( 'Launch' );

	// Wrap 'Launch' button in anchor to frankenflow.
	const launchButtonWrapper = document.createElement( 'a' );
	launchButtonWrapper.href = calypsoifyGutenberg.frankenflowUrl;
	launchButtonWrapper.append( launchButton );

	// Put 'Launch' and 'Save' back on bar in desired order.
	settingsBar.prepend( launchButtonWrapper );
	settingsBar.prepend( saveButton );
}
