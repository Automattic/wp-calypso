/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';
import { addAction } from '@wordpress/hooks';
import { select, dispatch } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import 'a8c-fse-common-data-stores';
import type { Site } from '@automattic/data-stores';

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
		isExperimental?: boolean;
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

	if (
		// Don't proceed if this function has already run
		handled ||
		// Don't proceed if the site has already been launched
		! window?.calypsoifyGutenberg?.isSiteUnlaunched ||
		// Don't proceed if the launch URL is missing
		! window?.calypsoifyGutenberg?.launchUrl
	) {
		return;
	}

	handled = true;

	// Asynchronously load site data to check if site is on a free or paid plan
	// 'select' function is first returning 'undefined' so we retry every 100ms
	let site: Site.SiteDetails | undefined;
	const awaitSiteData = setInterval( () => {
		site = select( 'automattic/site' ).getSite( window._currentSiteId );
		if ( ! site ) {
			return;
		}
		clearInterval( awaitSiteData );
	}, 100 );
	const getIsFreePlan = () => site?.plan?.is_free;

	const awaitSettingsBar = setInterval( () => {
		const settingsBar = document.querySelector( '.edit-post-header__settings' );
		if ( ! settingsBar ) {
			return;
		}
		clearInterval( awaitSettingsBar );

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

			/*
			 * Default:
			 * Clicking on the "Launch" button would open the control launch flow
			 * by redirecting the page to `launchUrl`.
			 *
			 * New Onboarding (with a free plan):
			 * If the site was created via New Onboarding flow (starting at /new) with a free plan,
			 * the control launch flow gets replaced by the "Step by Step" launch flow,
			 * displayed in a modal on top of the editor (no redirect needed)
			 */
			const shouldOpenStepByStepLaunch = isGutenboarding && getIsFreePlan();

			// This currently comes from a feature flag, but should eventually be
			// replaced with A/B testing logic
			const shouldOpenFocusedLaunch = window?.calypsoifyGutenberg?.isFocusedLaunchFlow;

			recordTracksEvent( 'calypso_newsite_editor_launch_click', {
				is_new_flow: shouldOpenStepByStepLaunch,
				is_experimental: isExperimental,
			} );

			if ( shouldOpenStepByStepLaunch ) {
				// If we want to load experimental features, for now '?latest' query param should be added in URL.
				// TODO: update this in calypsoify-iframe.tsx depending on abtest or other conditions.
				isExperimental && dispatch( 'automattic/launch' ).enableExperimental();

				// Open editor-site-launch sidebar
				dispatch( 'automattic/launch' ).openSidebar();
				setTimeout( () => {
					dispatch( 'core/editor' ).savePost();
				}, 1000 );
			} else if ( shouldOpenFocusedLaunch ) {
				dispatch( 'automattic/launch' ).openFocusedLaunch();
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
