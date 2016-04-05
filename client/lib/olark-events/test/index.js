/**
 * Internal dependencies
 */
import './lib/mock-olark.js';
import olarkEvents from 'lib/olark-events';

describe( 'Olark events', () => {
	before( () => {
		olarkEvents.initialize();

		// emit a fake api.chat.onReady event
		olarkEvents.emit( 'api.chat.onReady' );
	} );

	// Test that a listener for the api.chat.onReady event will always have it's callback executed if the event has already fired.
	it( 'should trigger on api.chat.onReady', ( done ) => {
		olarkEvents.on( 'api.chat.onReady', () => {
			done();
		} );
		setTimeout( () => done( 'Did not trigger' ), 20 );
	} );

	// Test that nested event listener callbacks for the api.chat.onReady event will always be executed if the event has already fired.
	// #9668 fixes a bug where this nesting of events doesn't work properly.
	it( 'should trigger on nested api.chat.onReady', ( done ) => {
		olarkEvents.on( 'api.chat.onReady', () => {
			olarkEvents.on( 'api.chat.onReady', () => {
				done();
			} );
		} );
		setTimeout( () => done( 'Did not trigger' ), 20 );
	} );
} );
