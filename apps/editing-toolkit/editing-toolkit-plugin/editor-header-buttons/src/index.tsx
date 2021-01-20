/**
 * External Dependencies
 */
import * as React from 'react';
import ReactDOM from 'react-dom';
import domReady from '@wordpress/dom-ready';

/**
 * Internal Dependencies
 */

import './styles.scss';

domReady( () => {
	const editorHeaderButtonsInception = setInterval( () => {
		// Cycle through interval until header toolbar is found.
		const toolbar = document.querySelector( '.edit-post-header__settings' );

		if ( ! toolbar ) {
			return;
		}
		clearInterval( editorHeaderButtonsInception );

		// Add components toolbar with override class name (original will be hidden in ./style.scss).
		const componentsToolbar = document.createElement( 'div' );
		componentsToolbar.className = 'editor-header-buttons';
		toolbar.prepend( componentsToolbar );

		const DummyComponent: React.FunctionComponent = () => <>hello world</>;

		ReactDOM.render( <DummyComponent />, componentsToolbar );
	} );
} );
