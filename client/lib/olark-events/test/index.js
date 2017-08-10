/** @format */
/**
 * Internal dependencies
 */
import olarkMock from './mock/olark';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Olark events', () => {
	let olarkEvents;

	useFakeDom();

	before( () => {
		/**
		 * Defining the global window and window.olark object here will prevent the real olark api located at lib/olark-api
		 * from being created because it will generate a bunch of javascript errors about missing window and
		 * window.document. If you look at that code it checks if window.olark already exists before it tries to
		 * create it.
		 */
		global.window.olark = olarkMock;
		olarkEvents = require( 'lib/olark-events' );
		olarkEvents.initialize();

		// emit a fake api.chat.onReady event
		olarkEvents.emit( 'api.chat.onReady' );
	} );

	// Test that a listener for the api.chat.onReady event will always have it's callback executed if the event has already fired.
	it( 'should trigger on api.chat.onReady', done => {
		olarkEvents.on( 'api.chat.onReady', () => {
			done();
		} );
	} );

	// Test that nested event listener callbacks for the api.chat.onReady event will always be executed if the event has already fired.
	// #9668 fixes a bug where this nesting of events doesn't work properly.
	it( 'should trigger on nested api.chat.onReady', done => {
		olarkEvents.on( 'api.chat.onReady', () => {
			olarkEvents.on( 'api.chat.onReady', () => {
				done();
			} );
		} );
	} );
} );
