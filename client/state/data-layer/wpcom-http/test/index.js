/**
 * External dependencies
 */
import { expect, assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { http } from '../actions';
import useMockery from 'test/helpers/use-mockery';

const requestKey = require( '../' ).requestKey;
let queueRequest = require( '../' ).queueRequest;

describe( 'WPCOM HTTP Data Layer', () => {
	describe( '#requestKey', () => {
		it( 'should create a requestKey based off of path & query params', () => {
			const httpAction = http( {
				path: '/read/chickens',
				method: 'GET',
				apiVersion: '1.2',
			} );

			assert.equal( requestKey( httpAction ), 'path=/read/chickens&apiVersion=1.2' );
		} );
	} );

	describe( '#queueRequest', () => {
		const responseCallbacks = [];
		const next = sinon.spy();

		useMockery( mockery => {
			const reqStub = ( arg1, arg2, fnOrBody, fn ) => fn
				? responseCallbacks.push( fn )
				: responseCallbacks.push( fnOrBody );

			const wpStub = { req: { get: reqStub, post: reqStub } };
			mockery.registerMock( 'lib/wp', wpStub );
			queueRequest = require( '../' ).queueRequest;
		} );

		afterEach( () => {
			responseCallbacks.forEach( callback => callback( null ) );
			next.reset();
		} );

		it( 'should drop calls with the same key', ( done ) => {
			const httpAction = http( {
				path: '/read/chickens',
				method: 'GET',
				onSuccess: { type: 'test' },
			} );

			const dispatch = sinon.spy( action => {
				if ( action.type === 'test' && dispatch.callCount === 2 ) {
					expect( next.callCount ).to.be.equal( 2 );
					done();
				}
			} );

			queueRequest( { dispatch }, httpAction, next );
			queueRequest( { dispatch }, httpAction, next );
			responseCallbacks.forEach( callback => callback( null ) );
			queueRequest( { dispatch }, httpAction, next );
			responseCallbacks.forEach( callback => callback( null ) );
		} );

		it( 'should not drop calls that opt out inflight dedupe', ( done ) => {
			const httpAction = http( {
				path: '/read/chickens',
				method: 'GET',
				onSuccess: { type: 'test' },
				options: {
					allowDuplicateInflightRequests: true,
				}
			} );

			const dispatch = sinon.spy( action => {
				if ( action.type === 'test' && dispatch.callCount === 3 ) {
					expect( next.callCount ).to.be.equal( 3 );
					done();
				}
			} );

			queueRequest( { dispatch }, httpAction, next );
			queueRequest( { dispatch }, httpAction, next );
			queueRequest( { dispatch }, httpAction, next );
			responseCallbacks.forEach( callback => callback( null ) );
		} );

		it( 'should not drop identical POST calls', ( done ) => {
			const httpAction = http( {
				path: '/read/chickens',
				method: 'POST',
				onSuccess: { type: 'test' },
			} );

			const dispatch = sinon.spy( action => {
				if ( action.type === 'test' && dispatch.callCount === 2 ) {
					expect( next.callCount ).to.be.equal( 2 );
					done();
				}
			} );

			queueRequest( { dispatch }, httpAction, next );
			queueRequest( { dispatch }, httpAction, next );
			responseCallbacks.forEach( callback => callback( null ) );
		} );

		it( 'should not drop calls with same path but different query', ( done ) => {
			const httpAction1 = http( {
				path: '/read/chickens',
				method: 'POST',
				onSuccess: { type: 'test' },
			} );

			const httpAction2 = http( {
				path: '/read/chickens',
				method: 'POST',
				apiVersion: '1.2',
				onSuccess: { type: 'test' },
			} );

			const dispatch = sinon.spy( action => {
				if ( action.type === 'test' && dispatch.callCount === 2 ) {
					expect( next.callCount ).to.be.equal( 2 );
					done();
				}
			} );

			queueRequest( { dispatch }, httpAction1, next );
			queueRequest( { dispatch }, httpAction2, next );
			responseCallbacks.forEach( callback => callback( null ) );
		} );
	} );
} );
