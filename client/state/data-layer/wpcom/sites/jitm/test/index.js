/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import noop from 'lodash';

/**
 * Internal dependencies
 */
import { fetchJITM, handleSiteSelection, handleRouteChange } from '..';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'jitms', () => {
	describe( 'fetchJITM', () => {
		const emptyJITM = {
			type: 'JITM_SET',
			jitms: [],
			keyedPath: 'test100',
		};

		it( 'should not dispatch', () => {
			const dispatch = spy();
			const state = {};
			const action = noop;

			fetchJITM( state, dispatch, action );
			expect( dispatch ).to.not.have.been.called;
		} );

		it( 'should dispatch', () => {
			const dispatch = spy(),
				state = {
					sites: {
						items: {
							100: {
								jetpack: true,
							}
						}
					},
					currentUser: {
						id: 1000
					},
					ui: {
						section: {
							name: 'test'
						}
					},
				},
				action_site_selected = {
					siteId: 100,
				},
				getState = () => state,
				action_loading = {
					isLoading: true
				}, action_loaded = {
					isLoading: false
				}, action_transition = {
					section: {
						name: 'test'
					}
				};

			// walk through the happy case of the process

			handleSiteSelection( { getState, dispatch }, action_site_selected );
			expect( dispatch ).to.not.have.been.called;

			handleRouteChange( { getState, dispatch }, action_loading );
			expect( dispatch ).to.not.have.been.called;

			handleRouteChange( { getState, dispatch }, action_loaded );
			expect( dispatch ).to.not.have.been.called;

			handleRouteChange( { getState, dispatch }, action_transition );
			expect( dispatch ).to.have.been.calledWithMatch( http( {
				apiNamespace: 'wpcom',
				method: 'GET',
				path: `/v2/sites/${ action_site_selected.siteId }/jitm/calypso:${ action_transition.section.name }:admin_notices`,
				query: {
					external_user_id: state.currentUser.id,
				}
			}, action_transition ) );
		} );

		it( 'should be an empty jitm if its not a jetpack site', () => {
			const dispatch = spy(),
				state = {
					sites: {
						items: {
							100: {
								jetpack: false,
							}
						}
					},
					currentUser: {
						id: 1000
					}
				},
				getState = () => state,
				action_transition = {
					section: {
						name: 'test'
					}
				};

			handleRouteChange( { getState, dispatch }, action_transition );
			expect( dispatch ).to.have.been.calledWithMatch( emptyJITM );
		} );
	} );
} );
