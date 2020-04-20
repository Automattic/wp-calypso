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
	window.wp.hooks.addAction( 'setGutenboardingStatus', 'a8c-gutenboarding', ( isGutenboarding ) => {
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

		// Wrap 'Launch' button link to frankenflow.
		const launchLink = document.createElement( 'a' );
		launchLink.href = calypsoifyGutenberg.frankenflowUrl;
		launchLink.target = '_top';
		launchLink.className =
			'gutenboarding-editor-overrides__launch-button components-button is-primary';
		const textContent = document.createTextNode( __( 'Launch' ) );
		launchLink.appendChild( textContent );

		// Put 'Launch' and 'Save' back on bar in desired order.
		settingsBar.prepend( launchLink );
		settingsBar.prepend( saveButton );
	} );
}
