/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';
import { addAction } from '@wordpress/hooks';
import { dispatch } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import 'a8c-fse-common-data-stores';

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

		const isMobile = window.innerWidth < 768;
		const isNewLaunch = window?.calypsoifyGutenberg?.isNewLaunch;

		// Assert reason: We have an early return above with optional and falsy values. This should be a string.
		const launchHref = window?.calypsoifyGutenberg?.frankenflowUrl as string;

		// On mobile there is not enough space to display "Complete setup" label.
		const launchLabel = isMobile
			? __( 'Launch', 'full-site-editing' )
			: __( 'Complete setup', 'full-site-editing' );

		const saveAndNavigate = async () => {
			await dispatch( 'core/editor' ).savePost();
			// Using window.top to escape from the editor iframe on WordPress.com
			window.top.location.href = launchHref;
		};

		const handleLaunch = ( e: Event ) => {
			// Disable href navigation
			e.preventDefault();

			const shouldOpenNewFlow = isNewLaunch && ! isMobile;

			recordTracksEvent( 'calypso_newsite_editor_launch_click', {
				is_new_flow: shouldOpenNewFlow,
			} );

			if ( shouldOpenNewFlow ) {
				// Open editor-site-launch sidebar
				dispatch( 'automattic/launch' ).openSidebar();
				setTimeout( () => {
					dispatch( 'core/editor' ).savePost();
				}, 1000 );
			} else {
				// Redirect to Calypso launch flow
				saveAndNavigate();
			}
		};

		const body = document.querySelector( 'body' );
		body.classList.add( 'editor-gutenberg-launch__fse-overrides' );

		// 'Update'/'Publish' primary button to become 'Save' tertiary button.
		const saveButton = settingsBar.querySelector( '.editor-post-publish-button__button' );
		// This line causes a reconciliation error in React and a page bork
		// leaving it in there until we can decide on the UX for this component
		//saveButton && ( saveButton.innerText = __( 'Save' ) );

		// Wrap 'Launch' button link to frankenflow.
		const launchLink = document.createElement( 'a' );

		launchLink.href = launchHref;
		launchLink.target = '_top';
		launchLink.className = 'editor-gutenberg-launch__launch-button components-button is-primary';

		const textContent = document.createTextNode( launchLabel );
		launchLink.appendChild( textContent );

		launchLink.addEventListener( 'click', handleLaunch );

		// Put 'Launch' and 'Save' back on bar in desired order.
		settingsBar.prepend( launchLink );
		saveButton && settingsBar.prepend( saveButton );
	} );
}
