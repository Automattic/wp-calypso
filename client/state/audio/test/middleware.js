import { HAPPYCHAT_IO_RECEIVE_MESSAGE } from 'calypso/state/action-types';
import middleware from '../middleware';

describe( 'Audio Middleware', () => {
	let next;
	let store;
	let play;
	let _window; // Keep a copy of the original window if any

	beforeEach( () => {
		next = jest.fn();

		store = {
			dispatch: jest.fn(),
		};

		// Spy on (new Audio()).play()
		play = jest.fn();
		_window = global.window;
		global.window = {
			Audio: jest.fn( function () {
				return { play };
			} ),
		};
	} );

	afterEach( () => {
		global.window = _window;
	} );

	test( 'should pass along actions without corresponding handlers', () => {
		const action = { type: 'UNSUPPORTED_ACTION' };

		middleware( store )( next )( action );

		expect( store.dispatch ).not.toBeCalled();
		expect( next ).toBeCalledWith( action );
	} );

	test( 'should not play any sound when no audio support', () => {
		const action = {
			type: HAPPYCHAT_IO_RECEIVE_MESSAGE,
			message: {
				source: 'operator',
			},
		};

		global.window = {};

		middleware( store )( next )( action );

		expect( store.dispatch ).not.toBeCalled();
		expect( next ).toBeCalledWith( action );
		expect( play ).not.toBeCalled();
	} );

	test( 'should play sound when receiving a new message from the operator', () => {
		const action = {
			type: HAPPYCHAT_IO_RECEIVE_MESSAGE,
			message: {
				source: 'operator',
			},
		};

		middleware( store )( next )( action );

		expect( store.dispatch ).not.toBeCalled();
		expect( next ).toBeCalledWith( action );
		expect( window.Audio ).toBeCalledWith( '/calypso/audio/chat-pling.wav' );
		expect( play ).toBeCalledWith();
	} );
} );
