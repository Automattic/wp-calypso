/**
 * External dependencies
 */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import reduxFluxSync from '../';
import { receiveSites } from 'state/sites/actions';

describe( 'reduxFluxSync', () => {
	let sandbox, store, dispatch, subscriberId;

	before( () => {
		chai.use( sinonChai );

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
		const sites = { 12345678: {
			ID: 12345678,
			URL: 'https://example.wordpress.com/'
		} };

		Dispatcher.handleServerAction( {
			type: 'SITES_RECEIVE',
			sites
		} );

		expect( dispatch ).to.have.been.calledWith( receiveSites( sites ) );
	} );
} );
