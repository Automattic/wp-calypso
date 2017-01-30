/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import dedupeRequests from '../dedupe-requests';

const requestStart = requestKey => ( {
	type: 'action',
	meta: {
		requestStart: requestKey,
	}
} );

const requestEnd = requestKey => ( {
	type: 'action',
	meta: {
		requestEnd: requestKey,
	}
} );

const NO_META_ACTION = {
	type: 'action',
};

describe( 'middleware', ( ) => {
	describe( 'dedupeRequests', () => {
		it( 'should allow through actions that do not have request meta', ( done ) => {
			const nextSpy = sinon.spy();
			dedupeRequests()( nextSpy )( NO_META_ACTION );

			expect( nextSpy ).to.have.been.calledWith( NO_META_ACTION );
			done();
		} );

		it( 'should allow through actions that are not inflight', ( done ) => {
			const nextSpy = sinon.spy();
			const action = requestStart( `${ Math.random() }` );

			dedupeRequests()( nextSpy )( action );

			expect( nextSpy ).to.have.been.calledWith( action );
			done();
		} );

		it( 'should dedupe actions that are inflight', ( done ) => {
			const nextSpy = sinon.spy();
			const action = requestStart( `${ Math.random() }` );

			dedupeRequests()( nextSpy )( action );
			dedupeRequests()( nextSpy )( action );

			expect( nextSpy ).to.have.been.calledWith( action );
			expect( nextSpy ).to.have.been.calledOnce;
			done();
		} );

		it( 'should allow repeat actions if the first one ends first', ( done ) => {
			const nextSpy = sinon.spy();
			const requestKey = `${ Math.random() }`;
			const requestStartAction = requestStart( requestKey );
			const requestEndAction = requestEnd( requestKey );

			dedupeRequests()( nextSpy )( requestStartAction );
			dedupeRequests()( nextSpy )( requestEndAction );
			dedupeRequests()( nextSpy )( requestStartAction );

			expect( nextSpy ).to.have.been.calledWith( requestStartAction );
			expect( nextSpy ).to.have.been.calledWith( requestEndAction );
			expect( nextSpy ).to.have.been.calledThrice;
			done();
		} );
	} );
} );

