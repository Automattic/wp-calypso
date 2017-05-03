/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { follow, unfollow } from 'state/reader/follows/actions';
import { requestUnfollow, receiveUnfollow, unfollowError } from '../';

describe( 'requestUnfollow', () => {
	it( 'should dispatch a http request', () => {
		const dispatch = spy();
		const next = spy();
		const action = unfollow( 'http://example.com' );
		requestUnfollow( { dispatch }, action, next );
		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'POST',
			path: '/read/following/mine/delete',
			apiVersion: '1.1',
			body: {
				url: 'http://example.com',
				source: 'calypso',
			},
			onSuccess: action,
			onFailure: action,
		} ) );
		expect( next ).to.have.been.calledWith( action );
	} );
} );

describe( 'receiveUnfollow', () => {
	it( 'should next the original action', () => {
		const dispatch = spy();
		const next = spy();
		const action = unfollow( 'http://example.com' );
		const response = {
			subscribed: false
		};
		receiveUnfollow( { dispatch }, action, next, response );
		expect( next ).to.be.calledWith( action );
	} );

	it( 'should dispatch an error notice when subscribed is true', () => {
		const dispatch = spy();
		const next = spy();
		const action = unfollow( 'http://example.com' );
		const response = {
			subscribed: true
		};

		receiveUnfollow( { dispatch }, action, next, response );
		expect( dispatch ).to.be.calledWithMatch( { type: 'NOTICE_CREATE' } );
		expect( next ) .to.be.calledWith( follow( 'http://example.com' ) );
	} );
} );

describe( 'followError', () => {
	it( 'should dispatch an error notice', () => {
		const dispatch = spy();
		const next = spy();
		const action = unfollow( 'http://example.com' );

		unfollowError( { dispatch }, action, next );
		expect( dispatch ).to.be.calledWithMatch( { type: 'NOTICE_CREATE' } );
		expect( next ) .to.be.calledWith( follow( 'http://example.com' ) );
	} );
} );
