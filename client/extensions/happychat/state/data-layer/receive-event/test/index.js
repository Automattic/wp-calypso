/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import receiveEvent from '../index';
import {
	HAPPYCHAT_RECEIVE_EVENT
} from 'extensions/happychat/state/action-types';

describe( 'Audio Middleware', () => {
	let store;
	let play;
	let _window; // Keep a copy of the original window if any

	beforeEach( () => {
		store = {
			dispatch: spy(),
		};

		// Spy on (new Audio()).play()
		play = spy();
		_window = global.window;
		global.window = {
			Audio: spy( function() {
				return { play };
			} ),
		};
	} );

	afterEach( () => {
		global.window = _window;
	} );

	it( 'should not play any sound when no audio support', () => {
		const action = {
			type: HAPPYCHAT_RECEIVE_EVENT,
			event: {
				source: 'operator',
			},
		};

		global.window = {};

		receiveEvent( store, action );
		expect( play ).to.not.have.beenCalled;
	} );

	it( 'should play sound when receiving a new message from the operator', () => {
		const action = {
			type: HAPPYCHAT_RECEIVE_EVENT,
			event: {
				source: 'operator',
			},
		};

		receiveEvent( store, action );

		expect( window.Audio ).to.have.been.calledWith( '/calypso/audio/chat-pling.wav' );
		expect( play ).to.have.beenCalled;
	} );
} );
