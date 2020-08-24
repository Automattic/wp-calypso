/**
 *
 *
 *
 * @file Interface to the third-party Real Time Messaging (RTM) widget from Directly.
 * @see https:
 */

/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { loadScript } from '@automattic/load-script';
import wpcom from 'lib/wp';

/**
 * Style dependencies
 */
import './style.scss';

const DIRECTLY_RTM_SCRIPT_URL = 'https://widgets.wp.com/directly/embed.js';
const DIRECTLY_ASSETS_BASE_URL = 'https://www.directly.com';
let directlyPromise;

/**
 * Gets the default set of options to configure the Directly RTM widget.
 * It's important to keep this config in a getter function, rather than a constant
 * on the module scope, to prevent import-time errors errors that could crash Calypso.
 *
 * @see https://cloudup.com/cySVQ9R_O6S for all configuration options
 *
 * @returns {object} The default configuration options
 */
function getDefaultOptions() {
	const ids = config( 'directly_rtm_widget_ids' );
	const env = config( 'directly_rtm_widget_environment' );

	return {
		id: ids[ env ],
		displayAskQuestion: false,
	};
}

/**
 * Set up global variables and configuration for the RTM widget
 *
 * @see https://cloudup.com/cySVQ9R_O6S for the standard setup instructions
 */
function configureGlobals() {
	// Set up the global DirectlyRTM function, required for the RTM widget.
	// This snippet is pasted from Directly's setup code.
	window.DirectlyRTM =
		window.DirectlyRTM ||
		function () {
			( window.DirectlyRTM.cq = window.DirectlyRTM.cq || [] ).push( arguments );
		};
	// Since we can only configure once per pageload, this library only provides a
	// single global configuration.
	window.DirectlyRTM( 'config', getDefaultOptions() );
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
 * Make the request for Directly's remote JavaScript.
 *
 * @returns {Promise} Promise that resolves after the script loads or fails
 */
function loadDirectlyScript() {
	return new Promise( ( resolve, reject ) => {
		loadScript( DIRECTLY_RTM_SCRIPT_URL, function ( error ) {
			if ( error ) {
				return reject( new Error( `Failed to load script "${ error.src }".` ) );
			}
			resolve();
		} );
	} );
}

/**
 * Initializes the RTM widget if it hasn't already been initialized. This sets up global
 * objects and DOM elements and requests the vendor script.
 *
 * @returns {Promise} Promise that resolves after initialization completes or fails
 */
export function initialize() {
	if ( directlyPromise instanceof Promise ) {
		return directlyPromise;
	}

	directlyPromise = wpcom
		.undocumented()
		.getDirectlyConfiguration()
		.then( ( { isAvailable } ) => {
			if ( ! isAvailable ) {
				return Promise.reject(
					new Error( 'Directly Real-Time Messaging is not available at this time.' )
				);
			}

			configureGlobals();
			insertDOM();
			return loadDirectlyScript();
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
	// There's a bug that happens when you "askQuestion" and the widget is showing the minimized
	// bubble with an expert avatar in it (indicating an active chat session). In this case,
	// the widget throws errors and becomes unusable.
	//
	// As of the time of this comment Directly is still investigating this issue, which
	// appears to be on their end. Their suggested stopgap is to "nagivate" out of the
	// active chat before the "askQuestion" fires, hence the solution here. Note that
	// "navigate" is an undocumented API, so you won't see it in the config guide.
	return execute( 'navigate', '/ask' ).then( () =>
		execute( 'askQuestion', { questionText, name, email } )
	);
}
