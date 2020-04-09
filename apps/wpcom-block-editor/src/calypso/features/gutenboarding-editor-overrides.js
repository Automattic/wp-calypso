/* global calypsoifyGutenberg */

/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { Popover } from '@wordpress/components';
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

		// Wrap 'Launch' button link to frankenflow.
		const launchLinkContainer = document.createElement( 'div' );
		const launchLink = document.createElement( 'a' );
		const launchTipContainer = document.createElement( 'div' );
		launchLinkContainer.className = 'gutenboarding-editor-overrides__launch-button-container';
		launchLink.href = calypsoifyGutenberg.frankenflowUrl;
		launchLink.target = '_top';
		launchLink.className =
			'gutenboarding-editor-overrides__launch-button components-button is-primary';
		const textContent = document.createTextNode( __( 'Launch' ) );
		launchLink.appendChild( textContent );
		launchLinkContainer.appendChild( launchLink );
		launchLinkContainer.appendChild( launchTipContainer );

		// Put 'Launch' and 'Save' back on bar in desired order.
		settingsBar.prepend( launchLinkContainer );
		settingsBar.prepend( saveButton );

		// We probably don't need this container, but I've added it in case we need some extra styling
		const launchTipContentContainer = window.wp.element.createElement(
			'span',
			{ className: 'gutenboarding-editor-overrides__launch-button-content' },
			__(
				"When you've finished customizing your site's content, launch your site to make it public."
			)
		);

		/*
			TODO:
				- Work out why the arrow isn't showing: https://developer.wordpress.org/block-editor/components/popover/#noarrow
				- Define when and how the popover should close. After `n` seconds?
		*/
		window.wp.element.render(
			window.wp.element.createElement(
				Popover,
				{
					className: 'gutenboarding-editor-overrides__launch-button-tip',
					position: 'bottom left',
				},
				launchTipContentContainer
			),
			launchTipContainer
		);
	} );
}
