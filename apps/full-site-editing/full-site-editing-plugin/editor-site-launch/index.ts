/**
 * External dependencies
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import domReady from '@wordpress/dom-ready';
import { addAction } from '@wordpress/hooks';
import 'a8c-fse-common-data-stores';
/**
 * Internal dependencies
 */
import LaunchButton from './src/launch-button';

interface CalypsoifyWindow extends Window {
	calypsoifyGutenberg?: {
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
	if ( handled || ! window?.calypsoifyGutenberg?.isGutenboarding ) {
		return;
	}

	handled = true;

	const awaitSettingsBar = setInterval( () => {
		const settingsBar = document.querySelector( '.edit-post-header__settings' );
		if ( ! settingsBar ) {
			return;
		}
		clearInterval( awaitSettingsBar );

		const launchButtonContainer = document.createElement( 'div' );
		settingsBar.prepend( launchButtonContainer );

		ReactDOM.render( React.createElement( LaunchButton ), launchButtonContainer );
	} );
}
