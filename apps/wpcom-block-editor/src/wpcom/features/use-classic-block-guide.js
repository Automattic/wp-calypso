/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { useState } from '@wordpress/element';
import { Guide } from '@wordpress/components';
// eslint-disable-next-line
import { useDispatch } from '@wordpress/data';
import url from 'url';
import { translate } from 'i18n-calypso';
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
					finishButtonText={ translate( 'Get started' ) }
					pages={ [
						{
							content: (
								<div className="use-classic-block-guide__wrapper">
									<div className="use-classic-block-guide__content">
										<h1 className="use-classic-block-guide__header">
											{ translate( 'Say hello to the Classic block' ) }
										</h1>
										<p>
											{ translate(
												'The block editor is now the default editor for all your sites, but you can still use the Classic block, if you prefer.'
											) }
										</p>
									</div>
									<div>
										<img
											alt="Screenshot of the Classic block"
											className="use-classic-block-guide__image"
											src="https://s0.wp.com/i/classic-block-welcome.png"
										/>
									</div>
								</div>
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
