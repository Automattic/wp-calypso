/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';
import { addAction } from '@wordpress/hooks';
import { dispatch } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import 'a8c-fse-common-data-stores';
// import type { Site } from '@automattic/data-stores';

// Depend on `core/editor` store.
import '@wordpress/editor';

/**
 * Internal dependencies
 */
import '../index.scss';

domReady( () => {
	updateEditor();
	// Hook fallback incase setGutenboardingStatus runs after initial dom render.
	// addAction( 'setGutenboardingStatus', 'a8c-gutenboarding', updateEditor );
} );

let handled = false;
function updateEditor() {
	// Don't proceed if this function has already run
	if ( handled ) {
		return;
	}

	handled = true;

	const awaitSettingsBar = setInterval( () => {
		const settingsBar = document.querySelector( '.edit-post-header__settings' );
		if ( ! settingsBar ) {
			return;
		}
		clearInterval( awaitSettingsBar );

		const handleLaunch = ( e: Event ) => {
			// Disable href navigation
			e.preventDefault();

			recordTracksEvent( 'calypso_newsite_editor_launch_click', {
				is_new_flow: true,
				// is_experimental: isExperimental,
				// Do we want to update this to track if this is focused launch or step by step?
				is_focused_launch: true,
			} );

			dispatch( 'automattic/launch' ).openFocusedLaunch();
			setTimeout( () => {
				dispatch( 'core/editor' ).savePost();
			}, 1000 );
		};

		const body = document.querySelector( 'body' );
		if ( ! body ) {
			return;
		}

		body.classList.add( 'editor-gutenberg-launch__fse-overrides' );

		// 'Update'/'Publish' primary button to become 'Save' tertiary button.
		const saveButton = settingsBar.querySelector( '.editor-post-publish-button__button' );
		// This line causes a reconciliation error in React and a page bork
		// leaving it in there until we can decide on the UX for this component
		//saveButton && ( saveButton.innerText = __( 'Save' ) );

		// Wrap 'Launch' button link to control launch flow.
		// TODO: Change to button?
		const launchLink = document.createElement( 'a' );
		launchLink.href = '#';
		launchLink.target = '_top';
		launchLink.className = 'editor-gutenberg-launch__launch-button components-button is-primary';

		/*
		 * translators: "Launch" here refers to launching a whole site.
		 * Please translate differently from "Publish", which intstead
		 * refers to publishing a page.
		 */
		const textContent = document.createTextNode( __( 'Launch', 'full-site-editing' ) );
		launchLink.appendChild( textContent );

		launchLink.addEventListener( 'click', handleLaunch );

		// Put 'Launch' and 'Save' back on bar in desired order.
		settingsBar.prepend( launchLink );
		saveButton && settingsBar.prepend( saveButton );
	} );
}
