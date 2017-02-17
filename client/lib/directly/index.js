/**
 * Internal dependencies
 */
import { initializeDirectly } from './vendor';

const DEFAULT_RTM_WIDGET_OPTIONS = {
	// Automattic widget ID
	id: '8a2968fc57d1e2f40157f42bf2d43160',
	// By default don't show the "Ask a Question" button
	displayAskQuestion: false
};

const directly = {
	initialize: function( config = {} ) {
		initializeDirectly( Object.assign( {}, DEFAULT_RTM_WIDGET_OPTIONS, config ) );
	},

	askQuestion: function( questionText, name, email ) {
		if ( ! window.DirectlyRTM ) {
			return;
		}
		window.DirectlyRTM( 'askQuestion', { questionText, name, email } );
	},

	maximize: function() {
		if ( ! window.DirectlyRTM ) {
			return;
		}
		window.DirectlyRTM( 'maximize' );
	},

	minimize: function() {
		if ( ! window.DirectlyRTM ) {
			return;
		}
		window.DirectlyRTM( 'minimize' );
	},

	openAskForm: function() {
		if ( ! window.DirectlyRTM ) {
			return;
		}
		window.DirectlyRTM( 'openAskForm' );
	},
};

export default directly;
