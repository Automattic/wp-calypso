/**
 * @file Interface to the third-party Real Time Messaging (RTM) widget from Directly.
 *
 * @see ./README.md for a higher-level overview
 * @see https://cloudup.com/cySVQ9R_O6S for Directly's configuration guide
 */

/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { loadScript } from 'lib/load-script';

const DEFAULT_RTM_WIDGET_OPTIONS = {
	id: config( 'directly_rtm_widget_id' ),
	displayAskQuestion: false
};
const DIRECTLY_RTM_SCRIPT_URL = 'https://widgets.wp.com/directly/embed.js';
const DIRECTLY_ASSETS_BASE_URL = 'https://www.directly.com';
let directlyPromise;

/**
 * Set up global variables and configuration for the RTM widget
 *
 * @see https://cloudup.com/cySVQ9R_O6S for the standard setup instructions
 */
function configureGlobals() {
	// Set up the global DirectlyRTM function, required for the RTM widget.
	// This snippet is pasted from Directly's setup code.
	window.DirectlyRTM = window.DirectlyRTM || function() {
		( window.DirectlyRTM.cq = window.DirectlyRTM.cq || [] ).push( arguments );
	};
	// Since we can only configure once per pageload, this library only provides a
	// single global configuration.
	window.DirectlyRTM( 'config', DEFAULT_RTM_WIDGET_OPTIONS );
}

/**
 * Inserts a dummy DOM element that the widget uses to calculate the base URL for its assets.
 *
 * Under standard setup, the RTM widget gathers its base URL by inspecting the src attribute of
 * the <script> used to load the library. Since we've got a custom setup that doesn't include
 * a <script> tag, we need to fake this by placing a DOM element with id="directlyRTMScript"
 * and a src with the appropriate base URL.
 *
 * @see https://cloudup.com/cySVQ9R_O6S for the standard setup instructions we've modified
 */
function insertDOM() {
	if ( null !== document.getElementById( 'directlyRTMScript' ) ) {
		return;
	}
	const d = document.createElement( 'div' );
	d.id = 'directlyRTMScript';
	d.src = DIRECTLY_ASSETS_BASE_URL;
	document.body.appendChild( d );
}

/**
 * Initializes the RTM widget if it hasn't already been initialized, and then executes the
 * command by passing the arguments to window.DirectlyRTM
 *
 * @returns {Promise} Promise that resolves after initialization and command execution
 */
function execute( ...args ) {
	return initialize().then( () => window.DirectlyRTM( ...args ) );
}

/**
 * Initializes the RTM widget if it hasn't already been initialized. This sets up global
 * objects and DOM elements and requests the vendor script.
 *
 * @returns {Promise} Promise that resolves after initialization completes
 */
export function initialize() {
	if ( directlyPromise instanceof Promise ) {
		return directlyPromise;
	}

	directlyPromise = new Promise( ( resolve, reject ) => {
		configureGlobals();
		insertDOM();

		loadScript( DIRECTLY_RTM_SCRIPT_URL, function( error ) {
			if ( error ) {
				reject( error );
			} else {
				resolve();
			}
		} );
	} );

	return directlyPromise;
}

/**
 * Ask a question to the Directly RTM widget.
 *
 * @param {string} questionText - The question to submit
 * @param {string} name - The question asker's name
 * @param {string} email - The question asker's email address
 * @returns {Promise} Promise that resolves after initialization completes
 */
export function askQuestion( questionText, name, email ) {
	return execute( 'askQuestion', { questionText, name, email } );
}
