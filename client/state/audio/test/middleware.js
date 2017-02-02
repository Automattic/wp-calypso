/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, stub } from 'sinon';

/**
 * Internal dependencies
 */
import middleware from '../middleware';
import { HAPPYCHAT_RECEIVE_EVENT } from 'state/action-types';

describe( 'Audio Middleware', () => {
	let next;
	let store;
	let play;

	beforeEach( () => {
		next = spy();

		store = {
			dispatch: spy(),
			getState: stub(),
			replaceReducers: spy(),
			subscribe: spy(),
		};

		store.getState.returns( Object.create( null ) );

		// Spy on (new Audio()).play()
		play = spy();
		global.window = {
			Audio: spy( function() {
				return { play };
			} ),
		};
	} );

	afterEach( () => {
		global.window = undefined;
	} );

	it( 'should pass along actions without corresponding handlers', () => {
		const action = { type: 'UNSUPPORTED_ACTION' };

		middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
	} );

	it( 'should fail silently when no audio support', () => {
		const action = {
			type: HAPPYCHAT_RECEIVE_EVENT,
			event: {
				source: 'operator',
			},
		};

		global.window = {};

		middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
		expect( play ).to.not.have.beenCalled;
	} );

	it( 'should play sound on HAPPYCHAT_RECEIVE_EVENT action', () => {
		const action = {
			type: HAPPYCHAT_RECEIVE_EVENT,
			event: {
				source: 'operator',
			},
		};

		middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
		expect( window.Audio ).to.have.been.calledWith( '/calypso/audio/chat-pling.wav' );
		expect( play ).to.have.been.calledWith();
	} );
} );
