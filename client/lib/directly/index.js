/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { initializeDirectly } from './vendor';

const DEFAULT_RTM_WIDGET_OPTIONS = {
	id: config( 'directly_rtm_widget_id' ),
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
