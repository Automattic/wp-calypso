import { NOTICE_CREATE } from 'calypso/state/action-types';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { follow, unfollow, removeFeedFromFollows } from 'calypso/state/reader/follows/actions';
import { removeFeedFromStream } from 'calypso/state/reader/streams/actions';
import { fromApi, requestUnfollow, unfollowError } from '../';

describe( 'following/mine/delete', () => {
	describe( 'requestUnfollow', () => {
		test( 'should dispatch a http request', () => {
			const action = unfollow( 'http://example.com' );
			const dispatch = jest.fn();

			requestUnfollow( action )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith(
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

		test( 'should dispatch stream removal actions', () => {
			const action = unfollow( 'http://example.com' );
			const dispatch = jest.fn();

			requestUnfollow( action )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith(
				removeFeedFromStream( {
					streamKey: 'following',
					feedUrl: 'http://example.com',
				} )
			);
			expect( dispatch ).toHaveBeenCalledWith(
				removeFeedFromStream( {
					streamKey: 'recent',
					feedUrl: 'http://example.com',
				} )
			);
			expect( dispatch ).toHaveBeenCalledWith( removeFeedFromFollows( 'http://example.com' ) );
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
