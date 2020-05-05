/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { PLAN_BUSINESS, PLAN_ECOMMERCE } from 'lib/plans/constants';
import { HAPPYCHAT_GROUP_WPCOM, HAPPYCHAT_GROUP_JPOP } from 'state/happychat/constants';
import { userState } from 'state/selectors/test/fixtures/user-state';
import getGroups from '../get-groups';

describe( 'selectors', () => {
	describe( '#getGroups()', () => {
		let _window; // Keep a copy of the original window if any
		const uiState = {
			ui: {
				section: {
					name: 'reader',
				},
			},
		};

		beforeEach( () => {
			_window = global.window;
			global.window = {};
		} );

		afterEach( () => {
			global.window = _window;
		} );

		test( 'should return default group for no sites', () => {
			const siteId = 1;
			const state = {
				...uiState,
				...userState,
				sites: {
					items: {},
				},
			};

			expect( getGroups( state, siteId ) ).toMatchObject( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		test( 'should return default group for no siteId', () => {
			const siteId = undefined;
			const state = {
				...uiState,
				...userState,
				sites: {
					items: {
						1: {},
					},
				},
			};

			expect( getGroups( state, siteId ) ).toMatchObject( [ HAPPYCHAT_GROUP_WPCOM ] );
		} );

		test( 'should return JPOP group for jetpack paid sites', () => {
			const siteId = 1;
			const state = {
				...uiState,
				...userState,
				currentUser: {
					id: 1,
					capabilities: {
						[ siteId ]: {
							manage_options: true,
						},
					},
				},
				sites: {
					items: {
						[ siteId ]: {
							jetpack: true,
							plan: {
								product_id: 2005,
								product_slug: 'jetpack_personal',
							},
						},
					},
				},
			};

			expect( getGroups( state, siteId ) ).toMatchObject( [ HAPPYCHAT_GROUP_JPOP ] );
		} );

		test( 'should return WPCOM for AT sites group for jetpack site', () => {
			const siteId = 1;

			[ PLAN_BUSINESS, PLAN_ECOMMERCE ].forEach( ( plan ) => {
				const state = {
					...uiState,
					...userState,
					currentUser: {
						id: 1,
						capabilities: {
							[ siteId ]: {
								manage_options: true,
							},
						},
					},
					sites: {
						items: {
							[ siteId ]: {
								jetpack: true,
								options: { is_automated_transfer: true },
								plan: { product_slug: plan },
							},
						},
					},
				};

				expect( getGroups( state, siteId ) ).toMatchObject( [ HAPPYCHAT_GROUP_WPCOM ] );
			} );
		} );

		if ( isEnabled( 'jetpack/happychat' ) ) {
			test( 'should return JPOP group if within the jetpack-connect section', () => {
				const state = {
					...userState,
					sites: {
						items: {
							1: {},
						},
					},
					ui: {
						section: {
							name: 'jetpack-connect',
						},
					},
				};

				expect( getGroups( state ) ).toMatchObject( [ HAPPYCHAT_GROUP_JPOP ] );
			} );
		} else {
			test.skip( 'should not return JPOP group if within the jetpack-connect section' );
		}
	} );
} );
