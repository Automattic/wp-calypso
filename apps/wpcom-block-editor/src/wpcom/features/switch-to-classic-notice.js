/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { __ } from '@wordpress/i18n';
/* eslint-disable import/no-extraneous-dependencies */

function ClassicEditorNotice() {
	return (
		<div className="switch-to-classic-notice__content">
			<h2>{ __( 'You are using the most modern WordPress editor yet.' ) }</h2>
			<p>{ __( "If you'd prefer you canswitch back to the Classic Editor" ) } </p>
		</div>
	);
}

domReady( () => {
	const editInception = setInterval( () => {
		// Cycle through interval until sidebar is found.
		const sidebar = document.querySelector( '.interface-interface-skeleton__sidebar' );

		if ( ! sidebar ) {
			return;
		}

		clearInterval( editInception );

		sidebar.classList.add( 'show-classic-editor-notice' );

		const switchToClassicNotice = document.createElement( 'div' );
		switchToClassicNotice.className = 'edit-post-switch-to-classic-notice';
		sidebar.append( switchToClassicNotice );

		ReactDOM.render( <ClassicEditorNotice />, switchToClassicNotice );
	} );
} );
