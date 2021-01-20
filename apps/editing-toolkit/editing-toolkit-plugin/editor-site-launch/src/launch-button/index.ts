/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';
import { dispatch } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import 'a8c-fse-common-data-stores';
import '@wordpress/editor';

/**
 * Internal dependencies
 */
import { STEP_BY_STEP_LAUNCH_FLOW, FOCUSED_LAUNCH_FLOW, REDIRECT_LAUNCH_FLOW } from '../constants';
import './styles.scss';

let handled = false;

domReady( () => {
	// If site launch options does not exist, stop.
	const siteLaunchOptions = window.wpcomEditorSiteLaunch;
	if ( ! siteLaunchOptions ) return;

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

		const body = document.querySelector( 'body' );
		if ( ! body ) {
			return;
		}

		const { launchUrl, launchFlow } = siteLaunchOptions;

		// Wrap 'Launch' button link to control launch flow.
		const launchButton = document.createElement( 'a' );
		launchButton.href = launchUrl;
		launchButton.target = '_top';
		launchButton.className = 'editor-gutenberg-launch__launch-button components-button is-primary';
		launchButton.addEventListener( 'click', ( e: Event ) => {
			// Prevent default behaviour
			e.preventDefault();

			recordTracksEvent( 'calypso_newsite_editor_launch_click', {
				flow: launchFlow,
			} );

			if ( launchFlow === STEP_BY_STEP_LAUNCH_FLOW ) {
				dispatch( 'automattic/launch' ).openSidebar();
			}

			if ( launchFlow === FOCUSED_LAUNCH_FLOW ) {
				dispatch( 'automattic/launch' ).openFocusedLaunch();
			}

			if ( launchFlow === REDIRECT_LAUNCH_FLOW ) {
				// Save post first before redirecting to launch url
				( async () => {
					await dispatch( 'core/editor' ).savePost();
					window.top.location.href = launchUrl;
				} )();
			} else {
				// Save post in the background while step-by-step or focused launch flow opens
				setTimeout( () => {
					dispatch( 'core/editor' ).savePost();
				}, 1000 );
			}
		} );

		/*
		 * translators: "Launch" here refers to launching a whole site.
		 * Please translate differently from "Publish", which intstead
		 * refers to publishing a page.
		 */
		const textContent = document.createTextNode( __( 'Launch', 'full-site-editing' ) );
		launchButton.appendChild( textContent );

		body.classList.add( 'editor-gutenberg-launch__fse-overrides' );

		// 'Update'/'Publish' primary button to become 'Save' tertiary button.
		const saveButton = settingsBar.querySelector( '.editor-post-publish-button__button' );
		// This line causes a reconciliation error in React and a page bork
		// leaving it in there until we can decide on the UX for this component
		// saveButton && ( saveButton.innerText = __( 'Save' ) );

		// Put 'Launch' and 'Save' back on bar in desired order.
		settingsBar.prepend( launchButton );
		saveButton && settingsBar.prepend( saveButton );
	} );
} );
