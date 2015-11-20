/**
 * External dependencies
 */
var expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	KeyBindings = require( 'lib/keyboard-shortcuts/key-bindings' ),
	KeyboardShortcuts = require( 'lib/keyboard-shortcuts' );

describe( 'KeyboardShortcuts', function() {

	it( 'should emit events to subscribers', function() {
		var arbitraryData = 'hello, world?',
			eventResult = '',
			handleEvent = function( data ) {
				eventResult = data;
			};

		KeyboardShortcuts.on( 'shortcut-event', handleEvent );
		KeyboardShortcuts.emitEvent( 'shortcut-event', arbitraryData );
		KeyboardShortcuts.off( 'shortcut-event', handleEvent );

		expect( eventResult ).to.equal( arbitraryData );
	} );
} );

describe( 'KeyBindings', function() {

	it( 'should have get function', function() {
		expect( KeyBindings.get ).to.be.a( 'function' );
	} );

	it( 'should return an object with strings for keys and arrays for values', function() {
		var bindings = KeyBindings.get();

		Object.keys( bindings ).forEach( function( category ) {
			expect( category ).to.be.a( 'string' );
			expect( bindings[ category ] ).to.be.an( 'array' );
		} );
	} );

	it( 'should emit an event when the language changes', function() {
		var languageChanged = false,
			handleLanguageChange = function() {
				languageChanged = true;
			};

		KeyBindings.on( 'language-change', handleLanguageChange );
		i18n.emit( 'change' );
		KeyBindings.off( 'language-change', handleLanguageChange );

		expect( languageChanged ).to.equal( true );
	} );

} );
