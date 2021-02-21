/**
 * Internal dependencies
 */
import { fromApi, requestUnfollow, unfollowError } from '../';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { follow, unfollow } from 'calypso/state/reader/follows/actions';

describe( 'following/mine/delete', () => {
	describe( 'requestUnfollow', () => {
		test( 'should dispatch a http request', () => {
			const action = unfollow( 'http://example.com' );

			expect( requestUnfollow( action ) ).toEqual(
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
		} );
	} );

	describe( 'fromApi', () => {
		test( 'should abort if subscribed is true', () => {
			expect( () => fromApi( { subscribed: true } ) ).toThrow();
		} );
	} );

	describe( 'followError', () => {
		test( 'should dispatch an error notice', () => {
			const action = unfollow( 'http://example.com' );
			const dispatch = jest.fn();
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

			unfollowError( action )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( expect.objectContaining( { type: NOTICE_CREATE } ) );
			expect( dispatch ).toHaveBeenCalledWith( bypassDataLayer( follow( 'http://example.com' ) ) );
		} );
	} );
} );
