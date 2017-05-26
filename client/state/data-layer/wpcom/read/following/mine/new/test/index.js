/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import { NOTICE_CREATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { follow, unfollow } from 'state/reader/follows/actions';
import { requestFollow, receiveFollow, followError } from '../';

describe( 'requestFollow', () => {
	it( 'should dispatch a http request', () => {
		const dispatch = spy();
		const next = spy();
		const action = follow( 'http://example.com' );
		requestFollow( { dispatch }, action, next );
		expect( dispatch ).to.have.been.calledWith(
			http( {
				method: 'POST',
				path: '/read/following/mine/new',
				apiVersion: '1.1',
				body: {
					url: 'http://example.com',
					source: 'calypso',
				},
				onSuccess: action,
				onFailure: action,
			} )
		);
	} );
} );

describe( 'receiveFollow', () => {
	it( 'should dispatch updateFollow with new subscription info', () => {
		const dispatch = spy();
		const next = spy();
		const action = follow( 'http://example.com' );
		const response = {
			subscribed: true,
			subscription: {
				ID: 1,
				URL: 'http://example.com',
				blog_ID: 2,
				feed_ID: 3,
				date_subscribed: '1976-09-15T12:00:00Z',
				delivery_methods: {},
				is_owner: false,
			},
		};
		receiveFollow( { dispatch }, action, next, response );
		expect( next ).to.be.calledWith(
			follow( 'http://example.com', {
				ID: 1,
				URL: 'http://example.com',
				feed_URL: 'http://example.com',
				blog_ID: 2,
				feed_ID: 3,
				date_subscribed: 211636800000,
				delivery_methods: {},
				is_owner: false,
			} )
		);
	} );

	it( 'should dispatch an error notice when subscribed is false', () => {
		const dispatch = spy();
		const next = spy();
		const action = follow( 'http://example.com' );
		const response = {
			subscribed: false,
		};

		receiveFollow( { dispatch }, action, next, response );
		expect( dispatch ).to.be.calledWithMatch( { type: NOTICE_CREATE } );
		expect( next ).to.be.calledWith( unfollow( 'http://example.com' ) );
	} );
} );

describe( 'followError', () => {
	it( 'should dispatch an error notice', () => {
		const dispatch = spy();
		const next = spy();
		const action = follow( 'http://example.com' );

		followError( { dispatch }, action, next );
		expect( dispatch ).to.be.calledWithMatch( { type: NOTICE_CREATE } );
		expect( next ).to.be.calledWith( unfollow( 'http://example.com' ) );
	} );
} );
