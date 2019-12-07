/** @format */

/**
 * External dependencies
 */
import noop from 'lodash';

/**
 * Internal dependencies
 */
import { fetchJITM, handleSiteSelection, handleRouteChange } from '..';
import { http } from 'state/data-layer/wpcom-http/actions';

// Dispatch action that's optionally a thunk. Mock that simulates the thunk middleware
const createDispatcher = ( dispatch, getState ) => action => {
	if ( ! action ) {
		return;
	}
	if ( typeof action === 'function' ) {
		return action( dispatch, getState );
	}
	return dispatch( action );
};

describe( 'jitms', () => {
	describe( 'fetchJITM', () => {
		test( 'should not dispatch', () => {
			const dispatch = jest.fn();
			const getState = () => ( {} );
			const action = noop;

			fetchJITM( action )( dispatch, getState );
			expect( dispatch ).not.toHaveBeenCalled();
		} );

		test( 'should dispatch', () => {
			const dispatch = jest.fn();
			const state = {
				sites: {
					items: {
						100: {
							jetpack: true,
						},
					},
				},
				currentUser: {
					id: 1000,
				},
				ui: {
					section: {
						name: 'test',
					},
				},
			};
			const getState = () => state;
			const action_site_selected = { siteId: 100 };
			const action_loading = { isLoading: true };
			const action_loaded = { isLoading: false };
			const action_transition = { section: { name: 'test' } };

			// dispatch action that's optionally a thunk. Mock that simulates the thunk middleware
			const dispatcher = createDispatcher( dispatch, getState );

			// walk through the happy case of the process
			dispatcher( handleSiteSelection( action_site_selected ) );
			expect( dispatch ).not.toHaveBeenCalled();

			dispatcher( handleRouteChange( action_loading ) );
			expect( dispatch ).not.toHaveBeenCalled();

			dispatcher( handleRouteChange( action_loaded ) );
			expect( dispatch ).not.toHaveBeenCalled();

			dispatcher( handleRouteChange( action_transition ) );
			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						apiNamespace: 'rest',
						method: 'GET',
						path: '/v1.1/jetpack-blogs/100/rest-api/',
						query: {
							path: '/jetpack/v4/jitm',
							query: JSON.stringify( { message_path: 'calypso:test:admin_notices' } ),
							http_envelope: 1,
						},
					},
					{ ...action_transition, messagePath: 'test' }
				)
			);
		} );

		test( 'should be not set a jitm if not a jetpack site', () => {
			const dispatch = jest.fn();
			const state = {
				sites: {
					items: {
						100: {
							jetpack: false,
						},
					},
				},
				currentUser: {
					id: 1000,
				},
			};
			const getState = () => state;
			const action_transition = {
				section: {
					name: 'test',
				},
			};

			const dispatcher = createDispatcher( dispatch, getState );
			dispatcher( handleRouteChange( action_transition ) );
			expect( dispatch ).not.toHaveBeenCalled();
		} );

		test( 'should not dispatch for ignored routes', () => {
			const dispatch = jest.fn();
			const state = {
				ui: {
					route: {
						path: {
							current: '/jetpack/connect/site-type/yourjetpack.blog',
						},
					},
				},
				sites: {
					items: {
						100: {
							jetpack: true,
						},
					},
				},
				currentUser: {
					id: 1000,
				},
			};
			const getState = () => state;
			const action_transition = {
				section: {
					name: 'example',
				},
			};

			const dispatcher = createDispatcher( dispatch, getState );
			dispatcher( handleRouteChange( action_transition ) );
			expect( dispatch ).not.toHaveBeenCalled();
		} );
	} );
} );
