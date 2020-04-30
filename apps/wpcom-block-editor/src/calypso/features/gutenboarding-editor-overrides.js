/* global calypsoifyGutenberg */

/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import ReactDOM from 'react-dom';
import { Notice } from '@wordpress/components';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
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
	showFirstTimeNotice();
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

function showFirstTimeNotice() {
	const getPreviewButton = () => document.querySelector( '.editor-post-preview' );

	const awaitPreviewButton = setInterval( () => {
		const previewButton = getPreviewButton();
		if ( ! previewButton ) {
			return;
		}
		clearInterval( awaitPreviewButton );

		// Create preview link
		// Reuse the href from existing Preview button in the header
		// and trigger the click event handler (registered through jQuery)
		// as seen in handlePreview() in iframe-bridge-server.js.
		const previewLink = (
			<a
				href={ previewButton.href }
				onClick={ ( e ) => {
					e.preventDefault();
					// Need to requery this element because the PreviewButton
					// gets recreated when window is resized hence referencing
					// an old destroyed button wouldn't work.
					getPreviewButton().click();
				} }
				target="_top"
			/>
		);

		// Create first time notice
		const blockEditorHeader = document.querySelector( '.block-editor-editor-skeleton__header' );
		const firstTimeNotice = document.createElement( 'div' );

		// It seems that the close button doesn't work when the
		// notice component is manually injected, so we'll handle
		// the removal of this notice manually.
		const handleRemove = () => {
			blockEditorHeader.removeChild( firstTimeNotice );
		};

		ReactDOM.render(
			<Notice
				className="gutenboarding-editor-overrides__first-time-notice"
				status="success"
				onRemove={ handleRemove }
			>
				{ createInterpolateElement(
					__(
						'This is your Editor for your Home page content. To see what your site will look like when published, click <preview_link>Preview</preview_link> here or in the top bar.'
					),
					{
						preview_link: previewLink,
					}
				) }
			</Notice>,
			firstTimeNotice
		);

		// Show first time notice under block header
		blockEditorHeader.appendChild( firstTimeNotice );
	} );
}
