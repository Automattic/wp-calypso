/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';
import { addAction } from '@wordpress/hooks';
import { dispatch } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';

// Depend on `core/editor` store.
import '@wordpress/editor';

/**
 * Internal dependencies
 */
import './index.scss';

interface CalypsoifyWindow extends Window {
	calypsoifyGutenberg?: {
		frankenflowUrl?: string;
		isGutenboarding?: boolean;
		[ key: string ]: unknown;
	};
}
declare const window: CalypsoifyWindow;

domReady( () => {
	updateEditor();
	// Hook fallback incase setGutenboardingStatus runs after initial dom render.
	addAction( 'setGutenboardingStatus', 'a8c-gutenboarding', updateEditor );
} );

let handled = false;
function updateEditor() {
	if (
		handled ||
		! window?.calypsoifyGutenberg?.isGutenboarding ||
		! window?.calypsoifyGutenberg?.frankenflowUrl
	) {
		return;
	}

	handled = true;

	const awaitSettingsBar = setInterval( () => {
		const settingsBar = document.querySelector( '.edit-post-header__settings' );
		if ( ! settingsBar ) {
			return;
		}
		clearInterval( awaitSettingsBar );
		const body = document.querySelector( 'body' );
		body.classList.add( 'editor-gutenberg-launch__fse-overrides' );

		// 'Update'/'Publish' primary button to become 'Save' tertiary button.
		const saveButton = settingsBar.querySelector( '.editor-post-publish-button__button' );
		// This line causes a reconciliation error in React and a page bork
		// leaving it in there until we can decide on the UX for this component
		//saveButton && ( saveButton.innerText = __( 'Save' ) );

		// Wrap 'Launch' button link to frankenflow.
		const launchLink = document.createElement( 'a' );

		// Assert reason: We have an early return above with optional and falsy values. This should be a string.
		const launchHref = window?.calypsoifyGutenberg?.frankenflowUrl as string;

		// Temporary solution to test new launch flow
		const isNewLaunch = launchHref === 'new-launch';

		launchLink.href = launchHref;
		launchLink.target = '_top';
		launchLink.className = 'editor-gutenberg-launch__launch-button components-button is-primary';

		const launchLabel = isNewLaunch
			? __( 'Complete setup', 'full-site-editing' )
			: __( 'Launch', 'full-site-editing' );

		const textContent = document.createTextNode( launchLabel );
		launchLink.appendChild( textContent );

		const saveAndNavigate = async ( e: Event ) => {
			// Disable href navigation
			e.preventDefault();
			await dispatch( 'core/editor' ).savePost();

			recordTracksEvent( 'calypso_newsite_editor_launch_click' );

			if ( isNewLaunch ) {
				// Open editor-site-launch sidebar
				dispatch( 'core/interface' ).enableComplementaryArea(
					'core/edit-post',
					'a8c-editor-site-launch/launch-modal'
				);
			} else {
				// Using window.top to escape from the editor iframe on WordPress.com
				window.top.location.href = launchHref;
			}
		};
		launchLink.addEventListener( 'click', saveAndNavigate );

		// Put 'Launch' and 'Save' back on bar in desired order.
		settingsBar.prepend( launchLink );
		saveButton && settingsBar.prepend( saveButton );
	} );
}
