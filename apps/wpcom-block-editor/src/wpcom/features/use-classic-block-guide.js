/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { useState } from '@wordpress/element';
import { Guide } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import url from 'url';
/* eslint-enable import/no-extraneous-dependencies */

const parsedEditorUrl = url.parse( window.location.href, true );

const ClassicGuide = () => {
	const [ isOpen, setOpen ] = useState( true );

	const closeGuide = () => setOpen( false );

	// useDispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );

	return (
		<>
			{ isOpen && (
				<Guide
					onFinish={ closeGuide }
					pages={ [
						{
							content: (
								<>
									<h1>Welcome!</h1>
									<p>You can still use the Classic Block if you want</p>
								</>
							),
						},
					] }
				/>
			) }
		</>
	);
};

// Hard coding these values for now - query string can be passed in from client/gutenberg/editor/calypsoify-iframe.tsx
const guideDismissed = false;
parsedEditorUrl.query[ 'show-classic-block-guide' ] = true;

if ( parsedEditorUrl.query[ 'show-classic-block-guide' ] && ! guideDismissed ) {
	domReady( () => {
		const editInception = setInterval( () => {
			// Cycle through interval until blockEditor is found.
			const blockEditor = document.querySelector( '.block-editor' );

			if ( ! blockEditor ) {
				return;
			}

			clearInterval( editInception );

			const switchToClassicNotice = document.createElement( 'div' );
			switchToClassicNotice.className = 'edit-post-switch-to-classic-notice';
			blockEditor.parentNode.insertBefore( switchToClassicNotice, blockEditor );

			ReactDOM.render( <ClassicGuide />, switchToClassicNotice );
		}, 200 );
	} );
}
