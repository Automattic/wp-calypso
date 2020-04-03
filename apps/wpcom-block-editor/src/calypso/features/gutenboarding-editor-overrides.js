/* global calypsoifyGutenberg */

/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { dispatch, select } from '@wordpress/data';
import { render } from '@wordpress/element';
import { Modal } from '@wordpress/components';
/* eslint-disable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import './gutenboarding-editor-overrides.scss';

domReady( () => {
	calypsoifyGutenberg.isGutenboarding && updateEditor();
	calypsoifyGutenberg.isGutenboardingNewUser && updateWelcomeGuide();
	// Hook fallback incase setGutenboardingStatus runs after initial dom render.
	window.wp.hooks.addAction(
		'setGutenboardingStatus',
		'a8c-gutenboarding',
		( isGutenboarding, isGutenboardingNewUser ) => {
			isGutenboarding && updateEditor();
			isGutenboardingNewUser && updateWelcomeGuide();
		}
	);
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

function updateWelcomeGuide() {
	const wasGoingToShowWelcomeGuide = select( 'core/edit-post' ).isFeatureActive( 'welcomeGuide' );

	if ( wasGoingToShowWelcomeGuide ) {
		dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
	}

	const body = document.querySelector( 'body' );
	const modalContainer = document.createElement( 'div' );
	body.appendChild( modalContainer );

	const handleClose = () => {
		render( null, modalContainer, () => {
			body.removeChild( modalContainer );

			if ( wasGoingToShowWelcomeGuide ) {
				dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
			}
		} );
	};

	render( <UsernameModal onClose={ handleClose } />, modalContainer );
}

function UsernameModal( { onClose } ) {
	return (
		<Modal title="Welcome" onRequestClose={ onClose }>
			<div>TODO: fill in dialog</div>
		</Modal>
	);
}
