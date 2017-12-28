/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestUnfollow, receiveUnfollow, unfollowError } from '../';
import { NOTICE_CREATE } from 'client/state/action-types';
import { bypassDataLayer } from 'client/state/data-layer/utils';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { follow, unfollow } from 'client/state/reader/follows/actions';

describe( 'following/mine/delete', () => {
	describe( 'requestUnfollow', () => {
		test( 'should dispatch a http request', () => {
			const dispatch = spy();
			const action = unfollow( 'http://example.com' );
			const getState = () => ( {
				reader: {
					sites: {
						items: {},
					},
					feeds: {
						items: {},
					},
				},
			} );
			requestUnfollow( { dispatch, getState }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/read/following/mine/delete',
					apiVersion: '1.1',
					body: {
						url: 'http://example.com',
						source: 'calypso',
					},
					onSuccess: action,
					onFailure: action,
				} )
			);

			expect( dispatch ).to.be.calledWithMatch( { type: NOTICE_CREATE, notice: { status: null } } );
		} );
	} );

	describe( 'receiveUnfollow', () => {
		test( 'should dispatch an error notice and refollow when subscribed is true', () => {
			const dispatch = spy();
			const action = unfollow( 'http://example.com' );
			const getState = () => ( {
				reader: {
					sites: {
						items: {},
					},
					feeds: {
						items: {},
					},
				},
			} );
			const response = {
				subscribed: true,
			};

			receiveUnfollow( { dispatch, getState }, action, response );
			expect( dispatch ).to.be.calledWithMatch( { type: NOTICE_CREATE } );
			expect( dispatch ).to.be.calledWith( bypassDataLayer( follow( 'http://example.com' ) ) );
		} );
	} );

	describe( 'followError', () => {
		test( 'should dispatch an error notice', () => {
			const dispatch = spy();
			const action = unfollow( 'http://example.com' );
			const getState = () => ( {
				reader: {
					sites: {
						items: {},
					},
					feeds: {
						items: {},
					},
				},
			} );

			unfollowError( { dispatch, getState }, action );
			expect( dispatch ).to.be.calledWithMatch( { type: NOTICE_CREATE } );
			expect( dispatch ).to.be.calledWith( bypassDataLayer( follow( 'http://example.com' ) ) );
		} );
	} );
} );
