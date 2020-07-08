/**
 * External dependencies
 */
import sinon from 'sinon';
import { noop } from 'lodash';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

/**
 * Internal dependencies
 */
import noticesMiddleware, {
	handlers,
	onBillingTransactionRequestFailure,
	onPostDeleteFailure,
	onPostRestoreFailure,
	onPostSaveSuccess,
} from '../middleware';
import PostQueryManager from 'lib/query-manager/post';
import {
	BILLING_TRANSACTION_REQUEST_FAILURE,
	NOTICE_CREATE,
	POST_DELETE_FAILURE,
	POST_RESTORE_FAILURE,
	POST_SAVE_SUCCESS,
} from 'state/action-types';
import { successNotice, withoutNotice } from 'state/notices/actions';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'middleware', () => {
	describe( 'noticesMiddleware()', () => {
		let store, dispatchSpy;
		useSandbox( ( sandbox ) => {
			const spyMiddleware = () => ( next ) => {
				dispatchSpy = sandbox.spy( next );
				return ( action ) => dispatchSpy( action );
			};

			store = applyMiddleware( thunk, spyMiddleware )( createStore )( () => 'Hello' );
		} );

		beforeAll( () => {
			handlers.DUMMY_TYPE = ( action ) => ( dispatch, getState ) =>
				dispatch( successNotice( `${ getState() } ${ action.target }` ) );
		} );

		afterAll( () => {
			delete handlers.DUMMY_TYPE;
		} );

		const dummyCreator = ( target ) => ( { type: 'DUMMY_TYPE', target } );

		test( 'should trigger the observer corresponding to the dispatched action type', () => {
			noticesMiddleware( store )( noop )( dummyCreator( 'World' ) );

			sinon.assert.calledWithMatch( dispatchSpy, {
				type: NOTICE_CREATE,
				notice: { text: 'Hello World' },
			} );
		} );

		test( 'should not trigger the observer when meta.notices.skip is set to true', () => {
			noticesMiddleware( store )( noop )( withoutNotice( dummyCreator )( 'World' ) );

			sinon.assert.notCalled( dispatchSpy );
		} );
	} );

	describe( 'handlers', () => {
		let dispatch;
		useSandbox( ( sandbox ) => {
			dispatch = sandbox.spy();
		} );

		describe( 'onPostDeleteFailure()', () => {
			test( 'should dispatch error notice with truncated title if known', () => {
				const getState = () => ( {
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World, This Should Be Truncated',
									},
								},
							} ),
						},
					},
				} );

				onPostDeleteFailure( {
					type: POST_DELETE_FAILURE,
					siteId: 2916284,
					postId: 841,
				} )( dispatch, getState );

				sinon.assert.calledWithMatch( dispatch, {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while deleting "Hello World, This Sho..."',
					},
				} );
			} );

			test( 'should dispatch error notice with unknown title', () => {
				const getState = () => ( {
					posts: {
						queries: {},
					},
				} );

				onPostDeleteFailure( {
					type: POST_DELETE_FAILURE,
					siteId: 2916284,
					postId: 841,
				} )( dispatch, getState );

				sinon.assert.calledWithMatch( dispatch, {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while deleting the post',
					},
				} );
			} );
		} );

		describe( 'onPostRestoreFailure()', () => {
			test( 'should dispatch error notice with truncated title if known', () => {
				const getState = () => ( {
					posts: {
						queries: {
							2916284: new PostQueryManager( {
								items: {
									841: {
										ID: 841,
										site_ID: 2916284,
										global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
										title: 'Hello World, This Should Be Truncated',
									},
								},
							} ),
						},
					},
				} );

				onPostRestoreFailure( {
					type: POST_RESTORE_FAILURE,
					siteId: 2916284,
					postId: 841,
				} )( dispatch, getState );

				sinon.assert.calledWithMatch( dispatch, {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while restoring "Hello World, This Sho..."',
					},
				} );
			} );

			test( 'should dispatch error notice with unknown title', () => {
				const getState = () => ( {
					posts: {
						queries: {},
					},
				} );

				onPostRestoreFailure( {
					type: POST_RESTORE_FAILURE,
					siteId: 2916284,
					postId: 841,
				} )( dispatch, getState );

				sinon.assert.calledWithMatch( dispatch, {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while restoring the post',
					},
				} );
			} );
		} );

		describe( 'onPostSaveSuccess()', () => {
			test( 'should not dispatch if status has no corresponding text', () => {
				const noticeAction = onPostSaveSuccess( {
					type: POST_SAVE_SUCCESS,
					post: {
						title: 'Hello World',
						status: 'invalid',
					},
				} );

				expect( noticeAction ).toBeNull;
			} );

			test( 'should dispatch success notice for trash', () => {
				onPostSaveSuccess( {
					type: POST_SAVE_SUCCESS,
					post: { status: 'trash' },
					savedPost: { global_ID: 'asdfjkl' },
				} )( dispatch );

				sinon.assert.calledWithMatch( dispatch, {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						noticeId: 'trash_asdfjkl',
						text: 'Post successfully moved to trash.',
						button: 'Undo',
					},
				} );
			} );

			test( 'should dispatch success notice for publish', () => {
				onPostSaveSuccess( {
					type: POST_SAVE_SUCCESS,
					post: { status: 'publish' },
				} )( dispatch );

				sinon.assert.calledWithMatch( dispatch, {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully published',
					},
				} );
			} );
		} );

		describe( 'onBillingTransactionRequestFailure()', () => {
			const transactionId = 1234;

			test( 'should dispatch a "not found" notice for invalid_receipt error', () => {
				const noticeAction = onBillingTransactionRequestFailure( {
					type: BILLING_TRANSACTION_REQUEST_FAILURE,
					transactionId,
					error: {
						error: 'invalid_receipt',
					},
				} );

				expect( noticeAction ).toMatchObject( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: `Sorry, we couldn't find receipt #${ transactionId }.`,
						noticeId: `transaction-fetch-${ transactionId }`,
						displayOnNextPage: true,
						duration: 5000,
					},
				} );
			} );

			test( 'should dispatch a "problem" notice for errors other than invalid_receipt', () => {
				const noticeAction = onBillingTransactionRequestFailure( {
					type: BILLING_TRANSACTION_REQUEST_FAILURE,
					transactionId,
					error: {
						error: 'http_request_failed',
					},
				} );

				expect( noticeAction ).toMatchObject( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: "Sorry, we weren't able to load the requested receipt.",
						noticeId: `transaction-fetch-${ transactionId }`,
						displayOnNextPage: true,
					},
				} );
			} );
		} );
	} );
} );
