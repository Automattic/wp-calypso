/**
 *
 *
 *
 * @file Interface to the third-party Real Time Messaging (RTM) widget from Directly.
 * @see https:
 */
import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import wpcomRequest from 'wpcom-proxy-request';
import './style.scss';
const DIRECTLY_RTM_SCRIPT_URL = 'https://widgets.wp.com/directly/embed.js';
const DIRECTLY_ASSETS_BASE_URL = 'https://www.directly.com';

/**
 * Gets the default set of options to configure the Directly RTM widget.
 * It's important to keep this config in a getter function, rather than a constant
 * on the module scope, to prevent import-time errors errors that could crash Calypso.
 *
 * @see https://cloudup.com/cySVQ9R_O6S for all configuration options
 * @returns The default configuration options
 */
function getDefaultOptions() {
	const ids = config( 'directly_rtm_widget_ids' ) as Record< string, string >;
	const env = config( 'directly_rtm_widget_environment' ) as string;
	return {
		id: ids[ env ],
		displayAskQuestion: false,
	};
}

type Options = Record< string, string | boolean | number > | string;

type DTM = {
	( args: [ key: string, command: Options ] ): void;
	cq?: [ command: string, options?: Options ];
};

declare global {
	interface Window {
		DirectlyRTM: DTM;
	}
}

/**
 * Set up global variables and configuration for the RTM widget
 *
 * @see https://cloudup.com/cySVQ9R_O6S for the standard setup instructions
 */
function configureGlobals() {
	// Set up the global DirectlyRTM function, required for the RTM widget.
	// This snippet is pasted from Directly's setup code.
	if ( ! window.DirectlyRTM ) {
		window.DirectlyRTM = function ( ...args ) {
			if ( window.DirectlyRTM.cq ) {
				window.DirectlyRTM.cq.push( ...args );
			} else {
				window.DirectlyRTM.cq = args;
			}
		};
	}
	// Since we can only configure once per pageload, this library only provides a
	// single global configuration.
	window.DirectlyRTM( [ 'config', getDefaultOptions() ] );
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
 * @returns Promise that resolves after initialization and command execution
 */
async function execute( args: [ string, Options ] ) {
	await initializeDirectly();
	return window.DirectlyRTM( ...args );
}

/**
 * Make the request for Directly's remote JavaScript.
 *
 * @returns Promise that resolves after the script loads or fails
 */
function loadDirectlyScript() {
	return loadScript( DIRECTLY_RTM_SCRIPT_URL );
}
let directlyPromise: Promise< void >;

/**
 * Initializes the RTM widget if it hasn't already been initialized. This sets up global
 * objects and DOM elements and requests the vendor script.
 *
 * @returns Promise that resolves after initialization completes or fails
 */
export function checkAPIThenInitializeDirectly() {
	if ( directlyPromise instanceof Promise ) {
		return directlyPromise;
	}
	directlyPromise = wpcomRequest< { isAvailable: true } >( {
		path: '/help/directly/mine',
	} ).then( ( { isAvailable } ) => {
		if ( ! isAvailable ) {
			return Promise.reject(
				new Error( 'Directly Real-Time Messaging is not available at this time.' )
			);
		}
		return initializeDirectly();
	} );
	return directlyPromise;
}

/**
 * Initializes the RTM widget if it hasn't already been initialized. This sets up global
 * objects and DOM elements and requests the vendor script.
 *
 * @returns Promise that resolves after initialization completes or fails
 */
export function initializeDirectly() {
	if ( directlyPromise ) {
		return directlyPromise;
	}
	configureGlobals();
	insertDOM();
	directlyPromise = loadDirectlyScript();
	return directlyPromise;
}

/**
 * Ask a question to the Directly RTM widget.
 *
 * @param questionText - The question to submit
 * @param name - The question asker's name
 * @param email - The question asker's email address
 * @returns Promise that resolves after initialization completes
 */
export async function askDirectlyQuestion( questionText: string, name: string, email: string ) {
	// There's a bug that happens when you "askQuestion" and the widget is showing the minimized
	// bubble with an expert avatar in it (indicating an active chat session). In this case,
	// the widget throws errors and becomes unusable.
	//
	// As of the time of this comment Directly is still investigating this issue, which
	// appears to be on their end. Their suggested stopgap is to "nagivate" out of the
	// active chat before the "askQuestion" fires, hence the solution here. Note that
	// "navigate" is an undocumented API, so you won't see it in the config guide.
	await execute( [ 'navigate', '/ask' ] );
	return execute( [ 'askQuestion', { questionText, name, email } ] );
}
