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
	const getStub = stub();
	const wpStub = {
		req: {
			get: getStub
		}
	};
	const dispatchSpy = spy();
	const storeStub = {
		dispatch: dispatchSpy
	};

	useMockery( mockery => {
		mockery.registerMock( 'lib/warn', warnSpy );
		mockery.registerMock( 'lib/wp', wpStub );

		interceptStreamPageRequest = require( '../' ).interceptStreamPageRequest;
	} );

	afterEach( () => {
		warnSpy.reset();
		getStub.reset();
		dispatchSpy.reset();
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

		const request = interceptStreamPageRequest( storeStub, action, nextSpy );

		expect( getStub ).to.have.been.calledOnce;

		return request.then( () => {
			expect( dispatchSpy ).to.have.been.calledOnce;
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: 'READER_STREAMS_PAGE_RECEIVE',
				payload: fakeResponse,
				query: {
					one: 'time'
				},
				streamId: 'following'
			} );
		} );
	} );
} );
