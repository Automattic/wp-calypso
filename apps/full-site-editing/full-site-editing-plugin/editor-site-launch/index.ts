/**
 * External dependencies
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'a8c-fse-common-data-stores';

import LaunchButton from './src/launch-button';

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
