/**
 * External dependencies
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'a8c-fse-common-data-stores';

import PlansGridButton from './src/plans-grid-button';

const awaitSettingsBar = setInterval( () => {
	const settingsBar = document.querySelector( '.edit-post-header__settings' );
	if ( ! settingsBar ) {
		return;
	}
	clearInterval( awaitSettingsBar );

	const plansGridContainer = document.createElement( 'div' );
	settingsBar.prepend( plansGridContainer );

	ReactDOM.render( React.createElement( PlansGridButton ), plansGridContainer );
} );
