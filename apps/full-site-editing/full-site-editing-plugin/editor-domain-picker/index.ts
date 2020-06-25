/**
 * External dependencies
 */
import * as React from 'react';
import 'a8c-fse-common-data-stores';

import DomainPickerButton from './src/domain-picker-button';
import * as ReactDOM from 'react-dom';

const awaitSettingsBar = setInterval( () => {
	const settingsBar = document.querySelector( '.edit-post-header__settings' );
	if ( ! settingsBar ) {
		return;
	}
	clearInterval( awaitSettingsBar );

	const domainPickerContainer = document.createElement( 'div' );
	settingsBar.prepend( domainPickerContainer );

	ReactDOM.render( React.createElement( DomainPickerButton ), domainPickerContainer );
} );
