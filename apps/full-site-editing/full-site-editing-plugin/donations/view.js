/* global tb_show, tb_remove */

/**
 * External dependencies
 */
//import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
//import './view.scss';
const blockClassName = 'wp-block-a8c-donations';

/**
 * Since "close" button is inside our checkout iframe, in order to close it, it has to pass a message to higher scope to close the modal.
 *
 * @param {object} eventFromIframe - message event that gets emmited in the checkout iframe.
 * @listens message
 */
function handleIframeResult( eventFromIframe ) {
	if ( eventFromIframe.origin === 'https://subscribe.wordpress.com' && eventFromIframe.data ) {
		const data = JSON.parse( eventFromIframe.data );
		if ( data && data.action === 'close' ) {
			window.removeEventListener( 'message', handleIframeResult );
			tb_remove();
		}
	}
}

function donate( block, checkoutURL ) {
	block.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		window.scrollTo( 0, 0 );
		tb_show( null, checkoutURL + '&display=alternate&TB_iframe=true', null );
		window.addEventListener( 'message', handleIframeResult, false );
		const tbWindow = document.querySelector( '#TB_window' );
		tbWindow.classList.add( 'jetpack-memberships-modal' );

		// This line has to come after the Thickbox has opened otherwise Firefox doesn't scroll to the top.
		window.scrollTo( 0, 0 );
	} );
}

const initializeDonationBlocks = () => {
	const donationButtons = Array.prototype.slice.call(
		document.querySelectorAll( '.' + blockClassName + ' a' )
	);
	donationButtons.forEach( ( block ) => {
		if ( block.getAttribute( 'data-jetpack-block-initialized' ) === 'true' ) {
			return;
		}

		const checkoutURL = block.getAttribute( 'href' );
		try {
			donate( block, checkoutURL );
		} catch ( err ) {
			// eslint-disable-next-line no-console
			console.error( 'Problem donating ' + checkoutURL, err );
		}

		block.setAttribute( 'data-jetpack-block-initialized', 'true' );
	} );
};

if ( typeof window !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', initializeDonationBlocks );
}
