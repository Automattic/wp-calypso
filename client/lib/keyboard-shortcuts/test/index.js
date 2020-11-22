/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from 'calypso/lib/keyboard-shortcuts';

describe( 'KeyboardShortcuts', () => {
	test( 'should emit events to subscribers', () => {
		const arbitraryData = 'hello, world?';
		let eventResult = '';
		const handleEvent = function ( data ) {
			eventResult = data;
		};

		KeyboardShortcuts.on( 'shortcut-event', handleEvent );
		KeyboardShortcuts.emitEvent( 'shortcut-event', arbitraryData );
		KeyboardShortcuts.off( 'shortcut-event', handleEvent );

		expect( eventResult ).to.equal( arbitraryData );
	} );
} );
