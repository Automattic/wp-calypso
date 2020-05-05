/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from 'lib/keyboard-shortcuts';

describe( 'KeyboardShortcuts', () => {
	test( 'should emit events to subscribers', () => {
		let arbitraryData = 'hello, world?',
			eventResult = '',
			handleEvent = function ( data ) {
				eventResult = data;
			};

		KeyboardShortcuts.on( 'shortcut-event', handleEvent );
		KeyboardShortcuts.emitEvent( 'shortcut-event', arbitraryData );
		KeyboardShortcuts.off( 'shortcut-event', handleEvent );

		expect( eventResult ).to.equal( arbitraryData );
	} );
} );
