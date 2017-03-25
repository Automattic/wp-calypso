/**
 * External dependencies
 */
// only require keymaster if this is a browser environment
var keymaster = ( typeof window === 'undefined' ) ? undefined : require( 'keymaster' ),
	defaultFilter = keymaster ? keymaster.filter : undefined;

/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' ),
	keyBindings = require( 'lib/keyboard-shortcuts/key-bindings' ).get();

/**
 * Module variables
 */
var flatKeyBindings = [];

// flatten the key-bindings object to create an array of key-bindings
Object.keys( keyBindings ).forEach( function( category ) {
	flatKeyBindings = flatKeyBindings.concat( keyBindings[ category ] );
} );

// filter for `keymaster` that also ignores `contenteditable` nodes
function ignoreDefaultAndContentEditableFilter( event ) {
	return defaultFilter( event ) && ! event.target.isContentEditable;
}

/**
 * KeyboardShortcuts accepts an array of objects representing key-bindings and creates an EventEmitter
 * which emits an event when a keyboard shortcut is triggered.
 *
 * Format: [ { eventName: 'eventName', keys: [ 'command', 'enter'] }, ...]
 *
 * (Optional): Setting the 'type' property of a key-binding to 'sequence' will cause the keyboard shortcut
 * event to trigger only after the keys have been pressed in sequence.
 */
function KeyboardShortcuts( keyBindings ) {
	if ( ! ( this instanceof KeyboardShortcuts ) ) {
		return new KeyboardShortcuts( keyBindings );
	}

	// the last key and when it was pressed
	this.lastKey = undefined;
	this.lastKeyTime = undefined;

	// the time limit for determining whether two keys in order represent a key sequence
	this.timeLimit = 2000;

	// save a copy of the bound last-key-pressed handler so it can be removed later
	this.boundKeyHandler = this.handleKeyPress.bind( this );

	// bind the shortcuts if this is a browser environment
	if ( typeof window !== 'undefined' ) {
		keymaster.filter = ignoreDefaultAndContentEditableFilter;

		this.bindShortcuts( flatKeyBindings );
	}
}

KeyboardShortcuts.prototype.bindShortcuts = function( keyBindings ) {
	var self = this;

	// bind keys from the key bindings to their named events
	keyBindings.forEach( function( keyBinding ) {
		self.bindShortcut(
			keyBinding.eventName,
			keyBinding.keys,
			keyBinding.type,
			keyBinding.checkKeys
		);
	} );

	// bind the last-key-pressed handler for use in key sequences
	window.addEventListener( 'keydown', this.boundKeyHandler, false );
};

KeyboardShortcuts.prototype.bindShortcut = function( eventName, keys, type, checkKeys ) {
	var self = this,
		keyCombinations = [],
		matches;

	if ( typeof keys[ 0 ] === 'string' ) {
		// this is a single key combination
		keyCombinations = [ keys ];
	} else {
		// this is an array of key combinations
		keyCombinations = keys;
	}

	keyCombinations.forEach( function( keys ) {
		if ( 'sequence' === type ) {
			keymaster( keys[ 1 ], function( event, handler ) {
				if ( self.lastKey === keys[ 0 ] && self.lastKeyTime > Date.now() - self.timeLimit ) {
					self.emitEvent( eventName, event, handler );

					self.lastKey = keys[ 1 ];
					self.lastKeyTime = Date.now();

					// return false at the end of a sequence to prevent other shortcuts from firing
					return false;
				}
			} );
		} else {
			keys = keys.join( '+' );
			keymaster( keys, function( event, handler ) {
				var keyValue;
				// Check if the value of the pressed key matches. This is needed
				// for keys being used with shift modifiers, as the charCode only
				// matches the modified key: '/' instead of '?'. Many of these
				// keys are also dependent on keyboard layout. We are
				// checking against a list of values, rather than a singular '?'
				// due to this webkit bug:
				// https://bugs.webkit.org/show_bug.cgi?id=19906
				if ( checkKeys && checkKeys.length > 0 ) {
					keyValue = self._getKey( event );
					// TODO: Could this be replaced by Array#some ?
					matches = checkKeys.filter( function( key ) {
						return key === keyValue;
					} );
					if ( matches.length === 1 ) {
						self.emitEvent( eventName, event, handler );
					}
				} else {
					self.emitEvent( eventName, event, handler );
				}
			} );
		}
	} );
};

/**
 * Polyfill getter for KeyboardEvent.key. If Keyboard.key isn't available on the
 * event, we transform the unicode value of KeyboardEvent.keyIdentifier to what
 * it should be. Note that Windows/Webkit may return incorrect values for
 * keyIdentifier.
 * @param {object} event - KeyboardEvent
 * @returns {string} - key
 * @private
 */
KeyboardShortcuts.prototype._getKey = function( event ) {
	var key;
	if ( !! event.key ) {
		return event.key;
	}
	key = event.keyIdentifier; //U+00XX
	key = key.substring( 2, key.length );
	return String.fromCharCode( parseInt( key, 16 ) );
};

KeyboardShortcuts.prototype.emitEvent = function() {
	this.emit.apply( this, arguments );
};

KeyboardShortcuts.prototype.handleKeyPress = function( event ) {
	// make sure this key press is not targeted at an input/select/textarea with keymaster's filter
	if ( keymaster.filter( event ) ) {
		this.lastKey = String.fromCharCode( event.keyCode ).toLowerCase();
		this.lastKeyTime = Date.now();
	}
};

// add EventEmitter methods to prototype
Emitter( KeyboardShortcuts.prototype );

// Return a single instance of KeyboardShortcuts, which will be cached by webpack
module.exports = new KeyboardShortcuts( flatKeyBindings );
