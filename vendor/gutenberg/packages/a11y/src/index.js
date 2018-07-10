import addContainer from './addContainer';
import clear from './clear';
import domReady from '@wordpress/dom-ready';
import filterMessage from './filterMessage';

/**
 * Create the live regions.
 */
export const setup = function() {
	let containerPolite = document.getElementById( 'a11y-speak-polite' );
	let containerAssertive = document.getElementById( 'a11y-speak-assertive' );

	if ( containerPolite === null ) {
		containerPolite = addContainer( 'polite' );
	}
	if ( containerAssertive === null ) {
		containerAssertive = addContainer( 'assertive' );
	}
};

/**
 * Run setup on domReady.
 */
domReady( setup );

/**
 * Update the ARIA live notification area text node.
 *
 * @param {string} message  The message to be announced by Assistive Technologies.
 * @param {string} ariaLive Optional. The politeness level for aria-live. Possible values:
 *                          polite or assertive. Default polite.
 */
export const speak = function( message, ariaLive ) {
	// Clear previous messages to allow repeated strings being read out.
	clear();

	message = filterMessage( message );

	const containerPolite = document.getElementById( 'a11y-speak-polite' );
	const containerAssertive = document.getElementById( 'a11y-speak-assertive' );

	if ( containerAssertive && 'assertive' === ariaLive ) {
		containerAssertive.textContent = message;
	} else if ( containerPolite ) {
		containerPolite.textContent = message;
	}
};
