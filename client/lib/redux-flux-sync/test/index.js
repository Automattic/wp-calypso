/**
 * External dependencies
 */
import Chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import reduxFluxSync from '../';
import { receivePost } from 'state/posts/actions';

describe( 'reduxFluxSync', () => {
	let sandbox, store, dispatch, subscriberId;

	before( () => {
		Chai.use( sinonChai );

		sandbox = sinon.sandbox.create();
		sandbox.spy( Dispatcher, 'register' );
		dispatch = sandbox.spy();
		store = { dispatch };
	} );

	beforeEach( () => {
		sandbox.reset();
		subscriberId = reduxFluxSync( store );
	} );

	afterEach( () => {
		Dispatcher.unregister( subscriberId );
	} );

	after( () => {
		sandbox.restore();
	} );

	it( 'should register to the dispatcher', () => {
		expect( Dispatcher.register ).to.have.been.calledOnce;
	} );

	it( 'should return a dispatcher subscription ID', () => {
		expect( subscriberId ).to.be.a( 'string' );
	} );

	it( 'should dispatch when having received a mapped action', () => {
		const post = { ID: 1 };

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_TO_EDIT',
			post
		} );

		expect( dispatch ).to.have.been.calledWith( receivePost( post ) );
	} );
} );
