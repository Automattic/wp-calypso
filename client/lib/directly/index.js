/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
// import { loadScript } from 'lib/load-script';

const DIRECTLY_SCRIPT_PATH = 'https://www.directly.com/widgets/rtm/embed.js';
const DEFAULT_RTM_WIDGET_OPTIONS = {
	// Automattic widget ID
	id: '8a2968fc57d1e2f40157f42bf2d43160',
	// By default don't show the "Ask a Question" button
	displayAskQuestion: false
};

let initialized = false;

const loadDirectlyScript = ( callback = noop ) => {
	// It would be great to use lib/load-script here, however the Directly script requires
	// the <script> tag to have id="directlyRTMScript", otherwise it fails hard. So this is
	// a stripped-down version of lib/load-script with the id added.
	function handleCompletedRequest( event ) {
		let errorArgument = null;
		if ( this.readyState && this.readyState !== 'complete' ) {
			return;
		}
		if ( event.type === 'error' ) {
			errorArgument = { src: event.target.src };
		}
		callback( errorArgument );
		this.onload = this.onreadystatechange = this.onerror = null;
	}

	const script = document.createElement( 'script' );
	script.id = 'directlyRTMScript';
	script.src = DIRECTLY_SCRIPT_PATH;
	script.async = 1;
	script.onload = script.onreadystatechange = script.onerror = handleCompletedRequest;
	document.getElementsByTagName( 'head' )[ 0 ].appendChild( script );
};

const directly = {
	initialize: ( config = {}, callback = noop ) => {
		// Directly config and script loading can only happen once per pageload.
		if ( initialized ) {
			return;
		}
		initialized = true;

		// Set up the global DirectlyRTM function, required for the Directly library
		window.DirectlyRTM = window.DirectlyRTM || function() {
			( window.DirectlyRTM.cq = window.DirectlyRTM.cq || [] ).push( arguments );
		};

		// Before loading the script, we need to enqueue the config details
		window.DirectlyRTM( 'config', Object.assign( {}, DEFAULT_RTM_WIDGET_OPTIONS, ...config ) );

		// With config set we can load the script
		loadDirectlyScript( callback );
	},

	askQuestion: function( { questionText, name, email } ) {
		if ( !initialized ) {
			return;
		}
		
		// We're using destructuring and shorthand properties just to explicitly document
		// the options available from the Directly API.
		window.DirectlyRTM( 'askQuestion', { questionText, name, email } );
	},

	maximize: function() {
		if ( !initialized ) {
			return;
		}
		window.DirectlyRTM( 'maximize' );
	},

	minimize: function() {
		if ( !initialized ) {
			return;
		}
		window.DirectlyRTM( 'minimize' );
	},

	openAskForm: function() {
		if ( !initialized ) {
			return;
		}
		window.DirectlyRTM( 'openAskForm' );
	},
};

export default directly;
