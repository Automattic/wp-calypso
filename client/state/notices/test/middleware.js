/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import noticesMiddleware, {
	handlers,
	onPostDeleteFailure,
	onPostRestoreFailure,
	onPostSaveSuccess,
} from '../middleware';
import { dispatchSuccess, dispatchError } from '../utils';
import PostQueryManager from 'client/lib/query-manager/post';
import {
	NOTICE_CREATE,
	POST_DELETE_FAILURE,
	POST_RESTORE_FAILURE,
	POST_SAVE_SUCCESS,
} from 'client/state/action-types';
import { successNotice } from 'client/state/notices/actions';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'middleware', () => {
	describe( 'noticesMiddleware()', () => {
		let store;
		useSandbox( sandbox => {
			store = createStore( () => 'Hello' );
			sandbox.spy( store, 'dispatch' );
		} );

		beforeAll( () => {
			handlers.DUMMY_TYPE = ( dispatch, action, getState ) => {
				dispatch( successNotice( `${ getState() } ${ action.target }` ) );
			};
		} );

		afterAll( () => {
			delete handlers.DUMMY_TYPE;
		} );

		test( 'should trigger the observer corresponding to the dispatched action type', () => {
			noticesMiddleware( store )( noop )( { type: 'DUMMY_TYPE', target: 'World' } );

			expect( store.dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
				notice: {
					text: 'Hello World',
				},
			} );
		} );
	} );

	describe( 'utility', () => {
		let dispatch;
		useSandbox( sandbox => {
			dispatch = sandbox.spy();
		} );

		describe( 'dispatchSuccess()', () => {
			test( 'should return a function which upon being called dispatches the specified success message', () => {
				dispatchSuccess( 'Success!' )( dispatch );

				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Success!',
					},
				} );
			} );
		} );

		describe( 'dispatchError()', () => {
			test( 'should return a function which upon being called dispatches the specified error message', () => {
				dispatchError( 'Error!' )( dispatch );

				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'Error!',
					},
				} );
			} );
		} );
	} );

	describe( 'handlers', () => {
		let dispatch;
		useSandbox( sandbox => {
			dispatch = sandbox.spy();
		} );

		describe( 'onPostDeleteFailure()', () => {
			test( 'should dispatch error notice with truncated title if known', () => {
				onPostDeleteFailure(
					dispatch,
					{
						type: POST_DELETE_FAILURE,
						siteId: 2916284,
						postId: 841,
					},
					() => ( {
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
					} )
				);

				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while deleting "Hello World, This Sho..."',
					},
				} );
			} );

			test( 'should dispatch error notice with unknown title', () => {
				onPostDeleteFailure(
					dispatch,
					{
						type: POST_DELETE_FAILURE,
						siteId: 2916284,
						postId: 841,
					},
					() => ( {
						posts: {
							queries: {},
						},
					} )
				);

				expect( dispatch ).to.have.been.calledWithMatch( {
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
				onPostRestoreFailure(
					dispatch,
					{
						type: POST_RESTORE_FAILURE,
						siteId: 2916284,
						postId: 841,
					},
					() => ( {
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
					} )
				);

				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while restoring "Hello World, This Sho..."',
					},
				} );
			} );

			test( 'should dispatch error notice with unknown title', () => {
				onPostRestoreFailure(
					dispatch,
					{
						type: POST_RESTORE_FAILURE,
						siteId: 2916284,
						postId: 841,
					},
					() => ( {
						posts: {
							queries: {},
						},
					} )
				);

				expect( dispatch ).to.have.been.calledWithMatch( {
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
				onPostSaveSuccess( dispatch, {
					type: POST_SAVE_SUCCESS,
					post: {
						title: 'Hello World',
						status: 'invalid',
					},
				} );

				expect( dispatch ).to.not.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
				} );
			} );

			test( 'should dispatch success notice for trash', () => {
				onPostSaveSuccess( dispatch, {
					type: POST_SAVE_SUCCESS,
					post: { status: 'trash' },
				} );

				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully moved to trash',
					},
				} );
			} );

			test( 'should dispatch success notice for publish', () => {
				onPostSaveSuccess( dispatch, {
					type: POST_SAVE_SUCCESS,
					post: { status: 'publish' },
				} );

				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully published',
					},
				} );
			} );
		} );
	} );
} );
