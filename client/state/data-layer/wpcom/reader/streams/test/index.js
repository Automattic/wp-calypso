/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy, stub } from 'sinon';

/**
 * Internal Dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'streams', () => {
	let interceptStreamPageRequest;
	const warnSpy = spy();
	let getStub = stub();
	const wpStub = {
		req: {
			get: getStub
		}
	};
	const dispatchStub = stub();
	const storeStub = {
		dispatch: dispatchStub
	};

	useMockery( mockery => {
		mockery.registerMock( 'lib/warn', warnSpy );
		mockery.registerMock( 'lib/wp', wpStub );

		interceptStreamPageRequest = require( '../' ).interceptStreamPageRequest;
	} );

	afterEach( () => {
		warnSpy.reset();
		getStub.reset();
		dispatchStub.reset();
	} );

	it( 'should call next on an unknown stream id', () => {
		const fakeAction = {
			streamId: null
		};
		const nextSpy = spy();
		interceptStreamPageRequest( null, fakeAction, nextSpy );

		expect( nextSpy ).to.have.been.calledOnce;
		expect( nextSpy ).to.have.been.calledWith( fakeAction );
		expect( getStub ).to.have.not.been.called;
		expect( warnSpy ).to.have.been.calledOnce;
	} );

	it( 'should call the right api based on the stream id', () => {
		const action = {
			streamId: 'following',
			query: {
				one: 'time'
			},
		};
		const nextSpy = spy();

		const fakeResponse = {
			posts: []
		};

		getStub
			.withArgs( '/read/following', { apiVersion: '1.2' }, { one: 'time' } )
			.returns( Promise.resolve( fakeResponse ) );
		storeStub.dispatch = function( args ) {
			expect( args ).to.eql( {
				type: 'READER_STREAMS_PAGE_RECEIVE',
				payload: fakeResponse,
				query: {
					one: 'time'
				},
				streamId: 'following'
			} );
		};

		const promise = interceptStreamPageRequest( storeStub, action, nextSpy );

		expect( getStub ).to.have.been.calledOnce;
		expect( warnSpy ).to.have.not.been.called;
		expect( nextSpy ).to.have.been.calledOnce;

		promise.then(
			( r ) => {
				storeStub.dispatch = dispatchStub;
				return r;
			},
			( err ) => {
				storeStub.dispatch = dispatchStub;
				return Promise.reject( err );
			}
		);
		return promise;
	} );

	it( 'should prevent duplicate requests inflight', () => {
		const action = {
			streamId: 'following',
			query: { page: 1 }
		};
		getStub
			.withArgs( '/read/following', { apiVersion: '1.2' }, { page: 1 } )
			.returns( Promise.resolve( { posts: [] } ) );

		const nextSpy = spy();
		interceptStreamPageRequest( storeStub, action, nextSpy );
		const abortedNextSpy = spy();
		getStub.reset();
		dispatchStub.reset();
		interceptStreamPageRequest( storeStub, action, abortedNextSpy );
		expect( getStub ).to.have.not.been.called;
		expect( abortedNextSpy ).to.have.been.called;
		expect( dispatchStub ).to.have.not.been.called;
	} );
} );
