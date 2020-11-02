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
		launchUrl?: string;
		isGutenboarding?: boolean;
		isSiteUnlaunched?: boolean;
		isNewLaunchMobile?: boolean;
		isExperimental?: boolean;
		isPersistentLaunchButton?: boolean;
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
	const isGutenboarding = window?.calypsoifyGutenberg?.isGutenboarding;
	const isPersistentLaunchButton = window?.calypsoifyGutenberg?.isPersistentLaunchButton;

	if (
		// Don't proceed if this function has already run
		handled ||
		// Don't proceed if the site has already been launched
		! window?.calypsoifyGutenberg?.isSiteUnlaunched ||
		// Don't proceed if the launch URL is missing
		! window?.calypsoifyGutenberg?.launchUrl ||
		// Don't proceed is the site wasn't created through Gutenbaording,
		// or if the gutenboarding/persistent-launch-button flag is enabled
		! ( isGutenboarding || isPersistentLaunchButton )
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

		const BREAK_MEDIUM = 782;
		const isMobileViewport = window.innerWidth < BREAK_MEDIUM;
		const isNewLaunchMobile = window?.calypsoifyGutenberg?.isNewLaunchMobile;
		const isExperimental = window?.calypsoifyGutenberg?.isExperimental;

		// Assert reason: We have an early return above with optional and falsy values. This should be a string.
		const launchHref = window?.calypsoifyGutenberg?.launchUrl as string;

		const saveAndNavigate = async () => {
			await dispatch( 'core/editor' ).savePost();
			// Using window.top to escape from the editor iframe on WordPress.com
			window.top.location.href = launchHref;
		};

		const handleLaunch = ( e: Event ) => {
			// Disable href navigation
			e.preventDefault();

			// Clicking on the persisten "Launch" button (when added to the UI)
			// would normally open the control launch flow by redirecting the
			// page to `launchUrl`.
			// But if the site was created via Gutenboarding (/new),
			// and potentially depending on the browser's viewport, the control
			// launch flow replaced by a new "Complete setup" flow, appering in a
			// modal on top of the edittor (no redirect needed)
			const shouldOpenNewFlowModal =
				isGutenboarding && ( ! isMobileViewport || ( isMobileViewport && isNewLaunchMobile ) );

			recordTracksEvent( 'calypso_newsite_editor_launch_click', {
				is_new_flow: shouldOpenNewFlowModal,
				is_experimental: isExperimental,
			} );

			if ( shouldOpenNewFlowModal ) {
				// If we want to load experimental features, for now '?latest' query param should be added in URL.
				// TODO: update this in calypsoify-iframe.tsx depending on abtest or other conditions.
				isExperimental && dispatch( 'automattic/launch' ).enableExperimental();

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
		const launchLink = document.createElement( 'a' );

		launchLink.href = launchHref;
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
