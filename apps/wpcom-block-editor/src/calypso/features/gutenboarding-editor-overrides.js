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
import './gutenboarding-editor-overrides.scss';

domReady( () => {
	calypsoifyGutenberg.isGutenboarding && updateEditor();
	// Hook fallback incase setGutenboardingStatus runs after initial dom render.
	window.wp.hooks.addAction( 'setGutenboardingStatus', 'a8c-gutenboarding', isGutenboarding => {
		isGutenboarding && updateEditor();
	} );
} );

function updateEditor() {
	const body = document.querySelector( 'body' );
	body.classList.add( 'gutenboarding-editor-overrides' );

	updateSettingsBar();
}

function updateSettingsBar() {
	const awaitSettingsBar = setInterval( () => {
		const settingsBar = document.querySelector( '.edit-post-header__settings' );
		if ( ! settingsBar ) {
			return;
		}
		clearInterval( awaitSettingsBar );

		// 'Update'/'Publish' primary button to become 'Save' tertiary button.
		const saveButton = settingsBar.querySelector( '.editor-post-publish-button' );
		saveButton && ( saveButton.innerText = __( 'Save' ) );

		// Create a 'Launch' button.
		const launchButton = document.createElement( 'button' );
		launchButton.className =
			'gutenboarding-editor-overrides__launch-button components-button is-primary';
		launchButton.innerText = __( 'Launch' );

		// Wrap 'Launch' button in anchor to frankenflow.
		const launchButtonWrapper = document.createElement( 'a' );
		launchButtonWrapper.href = calypsoifyGutenberg.frankenflowUrl;
		launchButtonWrapper.target = '_top';
		launchButtonWrapper.append( launchButton );

		// Put 'Launch' and 'Save' back on bar in desired order.
		settingsBar.prepend( launchButtonWrapper );
		settingsBar.prepend( saveButton );
	} );
}
