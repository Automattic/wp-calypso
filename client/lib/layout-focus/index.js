/**
 * External dependencies
 */
var classes = require( 'component-classes' );

/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' ),
	config = require( 'config' );


/**
 * This module stores the current and previous
 * layout focus for easy, centralized access and
 * retrieval from anywhere in the app.
 *
 * These focus area values are whitelisted and used for informing
 * what the focus for any view of Calypso should be.
 */
var layoutFocus = {

	// Store `current` and `previous` states
	// as internal attributes
	_current: null,
	_previous: null,
	_next: null,

	// These are the three structural areas
	// of the main body of Calypso
	_areas: [ 'content', 'sidebar', 'sites', 'preview' ],

	getCurrent: function() {
		return this._current || 'content';
	},

	getPrevious: function() {
		return this._previous;
	},

	set: function( area ) {

		if ( ! this.isValid( area ) || area === this._current ) {
			return;
		}

		this._previous = this._current;

		this.setFocusHideClass();


		// Update current state and emit change event
		this._current = area;
		this.emit( 'change' );
	},

	/**
	 * Advanced to the next focus area if there is
	 * one queued.
	 */
	next: function() {
		var area = this._next;

		// If we don't have a change queued and the focus has changed
		// previously, set it to `content`. This avoids having to set the
		// focus to content on all navigation links because it becomes the
		// default after focus has shifted.
		if ( ! area && this.hasChanged() ) {
			area = 'content';
		}

		if ( ! area ) {
			return;
		}

		this._next = null;

		this.set( area );
	},

	hasChanged: function() {
		return this._previous !== null;
	},

	isValid: function( area ) {
		var valid = this._areas.indexOf( area ) !== -1;

		if ( ! valid ) {
			if ( config( 'env' ) === 'development' ) {
				throw new Error( area + ' is not a valid layout focus area' );
			}
		}

		return valid;
	},

	setNext: function( area ) {

		if ( ! this.isValid( area ) ) {
			return;
		}

		this._next = area;
	},

	// This is unfortunately necessary to avoid layout elements still in the DOM
	// being targeted by things like browser inline search, which may cause odd
	// positioning effects by having their CSS modified.
	setFocusHideClass: function() {
		// Whenever layout focus changes remove `focus-hide` so
		// that animations can occur with all elements visible.
		classes( document.documentElement ).remove( 'focus-hide' );

		// After transitions restore `focus-hide`
		setTimeout( function() {
			classes( document.documentElement ).add( 'focus-hide' );
		}, 200 );
	}
};

/**
 * Mixins
 */
Emitter( layoutFocus );

/**
 * Expose `laoutFocus` singleton
 */
module.exports = layoutFocus;
