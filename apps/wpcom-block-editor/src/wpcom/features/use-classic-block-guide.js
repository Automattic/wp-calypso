/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { useState } from '@wordpress/element';
import { Guide } from '@wordpress/components';

const ClassicGuide = () => {
	const [ isOpen, setOpen ] = useState( true );

	const closeGuide = () => setOpen( false );

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

const guideDismissed = false;

if ( ! guideDismissed ) {
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
