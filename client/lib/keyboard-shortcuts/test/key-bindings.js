/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import KeyBindings from 'lib/keyboard-shortcuts/key-bindings';

describe( 'KeyBindings', () => {
	test( 'should have get function', () => {
		expect( KeyBindings.get ).to.be.a( 'function' );
	} );

	test( 'should return an object with strings for keys and arrays for values', () => {
		var bindings = KeyBindings.get();

		Object.keys( bindings ).forEach( function( category ) {
			expect( category ).to.be.a( 'string' );
			expect( bindings[ category ] ).to.be.an( 'array' );
		} );
	} );

	test( 'should emit an event when the language changes', () => {
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
