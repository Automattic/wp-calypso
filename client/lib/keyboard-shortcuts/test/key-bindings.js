/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import i18n from 'i18n-calypso';
import KeyBindings from 'lib/keyboard-shortcuts/key-bindings';

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
