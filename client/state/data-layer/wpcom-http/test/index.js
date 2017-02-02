/**
 * External dependencies
 */
import { expect, assert } from 'chai';
import sinon from 'sinon';
import { defer } from 'lodash';

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
				dedupe: true
			} );

			assert.equal(
				requestKey( httpAction ),
				`{ type: ${ httpAction.type }, path: ${ httpAction.path }, query: ${ httpAction.query } }`,
			);
		} );
	} );

	describe( '#queueRequest', () => {
		const promiseResolvers = [];
		const next = sinon.spy();

		useMockery( mockery => {
			const reqStub = sinon.stub();
			reqStub.returns( new Promise( resolve => promiseResolvers.push( resolve ) ) );

			const wpStub = { req: { get: reqStub, post: reqStub } };
			mockery.registerMock( 'lib/wp', wpStub );
			queueRequest = require( '../' ).queueRequest;
		} );

		afterEach( () => {
			promiseResolvers.forEach( resolve => resolve() );
			next.reset();
		} );

		it( 'should dedupe calls with the same key', ( done ) => {
			const httpAction = http( {
				path: '/read/chickens',
				method: 'GET',
				dedupe: true,
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
			promiseResolvers.forEach( resolve => resolve() );
			defer( () => queueRequest( { dispatch }, httpAction, next ) );
		} );

		it( 'should not dedupe calls without opting in via dedupe flag', ( done ) => {
			const httpAction = http( {
				path: '/read/chickens',
				method: 'GET',
				onSuccess: { type: 'test' },
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
			promiseResolvers.forEach( resolve => resolve() );
		} );

		it( 'should not dedupe POST calls', ( done ) => {
			const httpAction = http( {
				path: '/read/chickens',
				method: 'POST',
				onSuccess: { type: 'test' },
				dedupe: true,
			} );

			const dispatch = sinon.spy( action => {
				if ( action.type === 'test' && dispatch.callCount === 2 ) {
					expect( next.callCount ).to.be.equal( 2 );
					done();
				}
			} );

			queueRequest( { dispatch }, httpAction, next );
			queueRequest( { dispatch }, httpAction, next );
			promiseResolvers.forEach( resolve => resolve() );
		} );

		it( 'should not dedupe calls with same path but different query', ( done ) => {
			const httpAction1 = http( {
				path: '/read/chickens',
				method: 'POST',
				onSuccess: { type: 'test' },
				dedupe: true,
			} );

			const httpAction2 = http( {
				path: '/read/chickens',
				method: 'POST',
				apiVersion: '1.2',
				onSuccess: { type: 'test' },
				dedupe: true,
			} );

			const dispatch = sinon.spy( action => {
				if ( action.type === 'test' && dispatch.callCount === 2 ) {
					expect( next.callCount ).to.be.equal( 2 );
					done();
				}
			} );

			queueRequest( { dispatch }, httpAction1, next );
			queueRequest( { dispatch }, httpAction2, next );
			promiseResolvers.forEach( resolve => resolve() );
		} );
	} );
} );
