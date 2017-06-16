/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import { NOTICE_CREATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { follow, unfollow } from 'state/reader/follows/actions';

import useMockery from 'test/helpers/use-mockery';

describe( 'following/mine/delete', () => {
	let requestUnfollow, receiveUnfollow, unfollowError;
	useMockery( mockery => {
		mockery.registerMock( 'reader/stats', {
			recordFollow: noop,
		} );

		const module = require( '../' );
		requestUnfollow = module.requestUnfollow;
		receiveUnfollow = module.receiveUnfollow;
		unfollowError = module.unfollowError;
	} );

	describe( 'requestUnfollow', () => {
		it( 'should dispatch a http request', () => {
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
				} ),
			);

			expect( dispatch ).to.be.calledWithMatch(
				{ type: NOTICE_CREATE, notice: { status: null, button: 'Undo' } },
			);
		} );
	} );

	describe( 'receiveUnfollow', () => {
		it( 'should next the original action', () => {
			const dispatch = spy();
			const next = spy();
			const action = unfollow( 'http://example.com' );
			const response = {
				subscribed: false,
			};
			receiveUnfollow( { dispatch }, action, next, response );
			expect( next ).to.be.calledWith( action );
		} );

		it( 'should dispatch an error notice and refollow when subscribed is true', () => {
			const dispatch = spy();
			const next = spy();
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

			receiveUnfollow( { dispatch, getState }, action, next, response );
			expect( dispatch ).to.be.calledWithMatch( { type: NOTICE_CREATE } );
			expect( next ).to.be.calledWith( follow( 'http://example.com' ) );
		} );
	} );

	describe( 'followError', () => {
		it( 'should dispatch an error notice', () => {
			const dispatch = spy();
			const next = spy();
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

			unfollowError( { dispatch, getState }, action, next );
			expect( dispatch ).to.be.calledWithMatch( { type: NOTICE_CREATE } );
			expect( next ).to.be.calledWith( follow( 'http://example.com' ) );
		} );
	} );
} );
