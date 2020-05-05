/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { settingsReducer } from '../reducer';
import {
	DESERIALIZE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULES_RECEIVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	SERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		const state = reducer( undefined, {} );

		expect( state ).toHaveProperty( 'settings' );
	} );

	describe( 'settings', () => {
		const settings = {
			onboarding: {
				siteTitle: 'My awesome site',
				siteDescription: 'Not just another amazing WordPress site',
			},
		};

		test( 'should default to an empty object', () => {
			const state = settingsReducer( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should mark the module as active upon successful module activation', () => {
			const siteId = 12345678,
				initialState = {
					12345678: {
						setting_123: 'test',
						'module-a': false,
					},
				},
				action = {
					type: JETPACK_MODULE_ACTIVATE_SUCCESS,
					siteId,
					moduleSlug: 'module-a',
				};
			const state = settingsReducer( deepFreeze( initialState ), action );
			expect( state ).toEqual( {
				12345678: {
					setting_123: 'test',
					'module-a': true,
				},
			} );
		} );

		test( 'should mark the module as inactive upon successful module deactivation', () => {
			const siteId = 12345678,
				initialState = {
					12345678: {
						setting_123: 'test',
						'module-a': true,
					},
				},
				action = {
					type: JETPACK_MODULE_DEACTIVATE_SUCCESS,
					siteId,
					moduleSlug: 'module-a',
				};
			const state = settingsReducer( deepFreeze( initialState ), action );
			expect( state ).toEqual( {
				12345678: {
					setting_123: 'test',
					'module-a': false,
				},
			} );
		} );

		test( 'should update the module activation state upon receiving new modules', () => {
			const siteId = 12345678,
				initialState = {
					12345678: {
						setting_123: 'test',
						'module-a': true,
						'module-b': false,
					},
				},
				action = {
					type: JETPACK_MODULES_RECEIVE,
					siteId,
					modules: {
						'module-a': {
							active: false,
						},
						'module-b': {
							active: true,
						},
					},
				};
			const state = settingsReducer( deepFreeze( initialState ), action );
			expect( state ).toEqual( {
				12345678: {
					setting_123: 'test',
					'module-a': false,
					'module-b': true,
				},
			} );
		} );

		test( 'should update module settings with normalized ones when receiving new modules', () => {
			const siteId = 12345678,
				initialState = {
					12345678: {
						setting_123: 'test',
					},
				},
				action = {
					type: JETPACK_MODULES_RECEIVE,
					siteId,
					modules: {
						minileven: {
							active: true,
							options: {
								wp_mobile_excerpt: {
									current_value: true,
								},
								some_other_option: {
									current_value: '123',
								},
							},
						},
					},
				};
			const state = settingsReducer( deepFreeze( initialState ), action );
			expect( state ).toEqual( {
				12345678: {
					setting_123: 'test',
					minileven: true,
					wp_mobile_excerpt: true,
					some_other_option: '123',
				},
			} );
		} );

		test( 'should index settings by siteId', () => {
			const siteId = 12345678;
			const initialState = deepFreeze( {} );
			const state = settingsReducer( initialState, {
				type: JETPACK_SETTINGS_UPDATE,
				siteId,
				settings,
			} );

			expect( state ).toEqual( {
				[ siteId ]: settings,
			} );
		} );

		test( 'should store settings for new sites', () => {
			const siteId = 87654321;
			const initialState = deepFreeze( {
				[ 12345678 ]: settings,
			} );
			const state = settingsReducer( initialState, {
				type: JETPACK_SETTINGS_UPDATE,
				siteId,
				settings,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: settings,
			} );
		} );

		test( 'should add new settings for existing sites', () => {
			const siteId = 12345678;
			const newSettings = {
				onboarding: {
					...settings.onboarding,
					siteType: 'business',
				},
			};
			const initialState = deepFreeze( {
				[ siteId ]: settings,
				[ 87654321 ]: settings,
			} );
			const state = settingsReducer( initialState, {
				type: JETPACK_SETTINGS_UPDATE,
				siteId,
				settings: newSettings,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: newSettings,
			} );
		} );

		test( 'should update post-by-email address after regenerating', () => {
			const siteId = 12345678;
			const newSettings = {
				post_by_email_address: 'example1234@automattic.com',
			};
			const initialState = deepFreeze( {
				[ siteId ]: settings,
				[ 87654321 ]: settings,
			} );
			const state = settingsReducer( initialState, {
				type: JETPACK_SETTINGS_SAVE_SUCCESS,
				siteId,
				settings: newSettings,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: { ...settings, ...newSettings },
			} );
		} );

		test( "shouldn't update post-by-email address if it hasn't been regenerated", () => {
			const siteId = 12345678;
			const newSettings = {
				post_by_email_address: '',
			};
			const initialState = deepFreeze( {
				[ siteId ]: settings,
				[ 87654321 ]: settings,
			} );
			const state = settingsReducer( initialState, {
				type: JETPACK_SETTINGS_SAVE_SUCCESS,
				siteId,
				settings: newSettings,
			} );

			expect( state ).toEqual( initialState );
		} );

		test( 'should keep non-updated settings for sites', () => {
			const siteId = 12345678;
			const newSettings = {
				onboarding: {
					...settings.onboarding,
					siteDescription: 'A new description',
				},
			};

			const initialState = deepFreeze( {
				[ siteId ]: settings,
				[ 87654321 ]: settings,
			} );
			const state = settingsReducer( initialState, {
				type: JETPACK_SETTINGS_UPDATE,
				siteId,
				settings: newSettings,
			} );

			expect( state ).toEqual( {
				...initialState,
				[ siteId ]: newSettings,
			} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: settings,
			} );
			const state = settingsReducer( original, { type: SERIALIZE } );

			expect( state.root() ).toEqual( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: settings,
			} );

			const state = settingsReducer( original, { type: DESERIALIZE } );

			expect( state ).toEqual( original );
		} );

		test( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				[ 12345678 ]: [ 'test' ],
			} );
			const state = settingsReducer( original, { type: DESERIALIZE } );

			expect( state ).toEqual( {} );
		} );
	} );
} );
