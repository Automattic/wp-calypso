/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';

describe( 'KeyboardShortcuts', function() {
	let KeyboardShortcuts;

	useFilesystemMocks( __dirname );

	before( () => {
		KeyboardShortcuts = require( 'lib/keyboard-shortcuts' );
	} );

	it( 'should emit events to subscribers', function() {
		let arbitraryData = 'hello, world?',
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
