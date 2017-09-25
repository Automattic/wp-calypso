/**
 * External dependencies
 */
import store from 'store';

/**
 * Internal dependencies
 */
import Emitter from 'lib/mixins/emitter';

/**
 * This module stores the current and previous
 * layout focus for easy, centralized access and
 * retrieval from anywhere in the app.
 *
 * These focus area values are whitelisted and used for informing
 * what the focus for any view of Calypso should be.
 */
const nuxWelcome = {

	tempWelcome: false,

	showWelcome: store.get( 'show-welcome' ),

	setWelcome: function( persist ) {
		if ( persist ) {
			this.showWelcome = true;
			this.emit( 'change' );
			setTimeout( function() {
				store.set( 'show-welcome', true );
			}, 0 );
		} else {
			this.tempWelcome = true;
		}
	},

	getWelcome: function() {
		return ( this.tempWelcome || this.showWelcome );
	},

	clearTempWelcome: function() {
		if ( ! this.tempWelcome ) {
			return;
		}
		this.tempWelcome = false;
		this.emit( 'change' );
	},

	closeWelcome: function() {
		this.showWelcome = false;
		this.tempWelcome = false;
		store.remove( 'show-welcome' );
	}

};

/**
 * Mixins
 */
Emitter( nuxWelcome );

/**
 * Expose `nuxWelcome` singleton
 */
module.exports = nuxWelcome;
