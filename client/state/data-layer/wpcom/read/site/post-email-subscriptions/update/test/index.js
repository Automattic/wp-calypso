/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	requestUpdatePostEmailSubscription,
	receiveUpdatePostEmailSubscription,
	receiveUpdatePostEmailSubscriptionError,
} from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { updateNewPostEmailSubscription } from 'calypso/state/reader/follows/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestUpdatePostEmailSubscription', () => {
		test( 'should dispatch an http request with revert info on the success and failure actions', () => {
			const dispatch = jest.fn();
			const getState = () => {
				return {
					reader: {
						follows: {
							items: {
								foo: {
									blog_ID: 1234,
									delivery_methods: {
										email: {
											post_delivery_frequency: 'instantly',
										},
									},
								},
							},
						},
					},
				};
			};
			const action = updateNewPostEmailSubscription( 1234, 'daily' );
			const actionWithRevert = merge( {}, action, {
				meta: {
					previousState: 'instantly',
				},
			} );
			requestUpdatePostEmailSubscription( action )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'POST',
						path: '/read/site/1234/post_email_subscriptions/update',
						body: {
							delivery_frequency: 'daily',
						},
						apiVersion: '1.2',
					},
					actionWithRevert
				)
			);
		} );
	} );

	describe( 'receiveUpdatePostEmailSubscription', () => {
		test( 'should dispatch an update with the previous state if it is called with null', () => {
			const previousState = 'instantly';
			const result = receiveUpdatePostEmailSubscription(
				{ payload: { blogId: 1234 }, meta: { previousState } },
				null
			);
			expect( result[ 1 ] ).toEqual(
				bypassDataLayer( updateNewPostEmailSubscription( 1234, previousState ) )
			);
		} );

		test( 'should dispatch an update with the previous state if it fails', () => {
			const previousState = 'instantly';
			const result = receiveUpdatePostEmailSubscription(
				{ payload: { blogId: 1234 }, meta: { previousState } },
				{ success: false }
			);
			expect( result[ 1 ] ).toEqual(
				bypassDataLayer( updateNewPostEmailSubscription( 1234, previousState ) )
			);
		} );
	} );

	describe( 'receiveUpdatePostEmailSubscriptionError', () => {
		test( 'should dispatch an error and an update to the previous state', () => {
			const previousState = 'instantly';
			const result = receiveUpdatePostEmailSubscriptionError( {
				payload: { blogId: 1234 },
				meta: { previousState },
			} );
			expect( result[ 0 ].notice.text ).toBe(
				'Sorry, we had a problem updating that subscription. Please try again.'
			);
			expect( result[ 1 ] ).toEqual(
				bypassDataLayer( updateNewPostEmailSubscription( 1234, previousState ) )
			);
		} );
	} );
} );
