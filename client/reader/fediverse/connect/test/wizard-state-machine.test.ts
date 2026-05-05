import { INITIAL_STATE, wizardReducer } from '../wizard-state-machine';
import type { WizardState } from '../wizard-types';
import type { FediverseSiteCapabilities } from '@automattic/api-core';

function makeCaps(
	overrides: Partial< FediverseSiteCapabilities > = {}
): FediverseSiteCapabilities {
	return {
		activitypub_active: true,
		c2s_enabled: true,
		actors: {
			user: { enabled: true, can_enable: true },
			blog: { enabled: false, can_enable: true },
		},
		oauth_metadata: null,
		site_host: 'example.com',
		site_kind: 'wpcom',
		current_user_can_publish: true,
		...overrides,
	};
}

describe( 'wizardReducer', () => {
	describe( 'INITIAL_STATE', () => {
		it( 'has the expected shape', () => {
			expect( INITIAL_STATE ).toEqual( {
				name: 'PICKING_SITE',
				blogId: null,
				capabilities: null,
				authorizeUrl: null,
				errorStep: null,
				errorMessage: null,
			} );
		} );
	} );

	describe( 'PICK_SITE', () => {
		it( 'moves to CHECKING_CAPABILITIES and sets blogId', () => {
			const next = wizardReducer( INITIAL_STATE, { type: 'PICK_SITE', blogId: 42 } );
			expect( next.name ).toBe( 'CHECKING_CAPABILITIES' );
			expect( next.blogId ).toBe( 42 );
		} );

		it( 'clears prior capabilities and errors', () => {
			const prior: WizardState = {
				...INITIAL_STATE,
				name: 'ERROR',
				blogId: 10,
				capabilities: makeCaps(),
				errorStep: 'capability_check',
				errorMessage: 'old error',
				authorizeUrl: 'https://example.com/oauth',
			};
			const next = wizardReducer( prior, { type: 'PICK_SITE', blogId: 99 } );
			expect( next.capabilities ).toBeNull();
			expect( next.errorStep ).toBeNull();
			expect( next.errorMessage ).toBeNull();
			expect( next.authorizeUrl ).toBeNull();
			expect( next.blogId ).toBe( 99 );
		} );
	} );

	describe( 'CAPABILITIES_LOADED', () => {
		it( 'stores capabilities and moves to CHECKLIST_READY', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'CHECKING_CAPABILITIES', blogId: 5 };
			const caps = makeCaps();
			const next = wizardReducer( state, { type: 'CAPABILITIES_LOADED', capabilities: caps } );
			expect( next.name ).toBe( 'CHECKLIST_READY' );
			expect( next.capabilities ).toBe( caps );
		} );
	} );

	describe( 'CAPABILITIES_FAILED', () => {
		it( 'moves to ERROR with errorStep capability_check', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'CHECKING_CAPABILITIES', blogId: 5 };
			const next = wizardReducer( state, {
				type: 'CAPABILITIES_FAILED',
				message: 'network error',
			} );
			expect( next.name ).toBe( 'ERROR' );
			expect( next.errorStep ).toBe( 'capability_check' );
			expect( next.errorMessage ).toBe( 'network error' );
		} );
	} );

	describe( 'CONNECT_CLICKED', () => {
		it( 'moves to AUTHORIZING when all flags are green', () => {
			const state: WizardState = {
				...INITIAL_STATE,
				name: 'CHECKLIST_READY',
				capabilities: makeCaps(),
			};
			const next = wizardReducer( state, { type: 'CONNECT_CLICKED' } );
			expect( next.name ).toBe( 'AUTHORIZING' );
		} );

		it( 'moves to ENABLING_FEATURE when activitypub_active is false', () => {
			const state: WizardState = {
				...INITIAL_STATE,
				name: 'CHECKLIST_READY',
				capabilities: makeCaps( { activitypub_active: false } ),
			};
			const next = wizardReducer( state, { type: 'CONNECT_CLICKED' } );
			expect( next.name ).toBe( 'ENABLING_FEATURE' );
		} );

		it( 'moves to ENABLING_C2S when feature is on but c2s_enabled is false', () => {
			const state: WizardState = {
				...INITIAL_STATE,
				name: 'CHECKLIST_READY',
				capabilities: makeCaps( { activitypub_active: true, c2s_enabled: false } ),
			};
			const next = wizardReducer( state, { type: 'CONNECT_CLICKED' } );
			expect( next.name ).toBe( 'ENABLING_C2S' );
		} );

		it( 'moves to ENABLING_USER_ACTORS when c2s is on but user actors are disabled', () => {
			const state: WizardState = {
				...INITIAL_STATE,
				name: 'CHECKLIST_READY',
				capabilities: makeCaps( {
					activitypub_active: true,
					c2s_enabled: true,
					actors: {
						user: { enabled: false, can_enable: true },
						blog: { enabled: false, can_enable: true },
					},
				} ),
			};
			const next = wizardReducer( state, { type: 'CONNECT_CLICKED' } );
			expect( next.name ).toBe( 'ENABLING_USER_ACTORS' );
		} );

		it( 'returns unchanged state when capabilities are null', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'CHECKLIST_READY', capabilities: null };
			const next = wizardReducer( state, { type: 'CONNECT_CLICKED' } );
			expect( next ).toBe( state );
		} );
	} );

	describe( 'ENABLE_STEP_DONE', () => {
		it( 'moves to ENABLING_C2S when feature step done but c2s still off', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'ENABLING_FEATURE', blogId: 1 };
			const caps = makeCaps( { activitypub_active: true, c2s_enabled: false } );
			const next = wizardReducer( state, {
				type: 'ENABLE_STEP_DONE',
				step: 'feature',
				capabilities: caps,
			} );
			expect( next.name ).toBe( 'ENABLING_C2S' );
			expect( next.capabilities ).toBe( caps );
		} );

		it( 'moves to ENABLING_USER_ACTORS when c2s step done but user_actors still off', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'ENABLING_C2S', blogId: 1 };
			const caps = makeCaps( {
				activitypub_active: true,
				c2s_enabled: true,
				actors: {
					user: { enabled: false, can_enable: true },
					blog: { enabled: false, can_enable: true },
				},
			} );
			const next = wizardReducer( state, {
				type: 'ENABLE_STEP_DONE',
				step: 'c2s',
				capabilities: caps,
			} );
			expect( next.name ).toBe( 'ENABLING_USER_ACTORS' );
			expect( next.capabilities ).toBe( caps );
		} );

		it( 'moves to AUTHORIZING when user_actors step done and all green', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'ENABLING_USER_ACTORS', blogId: 1 };
			const caps = makeCaps();
			const next = wizardReducer( state, {
				type: 'ENABLE_STEP_DONE',
				step: 'user_actors',
				capabilities: caps,
			} );
			expect( next.name ).toBe( 'AUTHORIZING' );
		} );
	} );

	describe( 'ENABLE_STEP_FAILED', () => {
		it( 'moves to ERROR with errorStep permission_denied when permissionDenied is true', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'ENABLING_FEATURE', blogId: 1 };
			const next = wizardReducer( state, {
				type: 'ENABLE_STEP_FAILED',
				step: 'feature',
				message: 'denied',
				permissionDenied: true,
			} );
			expect( next.name ).toBe( 'ERROR' );
			expect( next.errorStep ).toBe( 'permission_denied' );
		} );

		it( 'moves to ERROR with errorStep enable_feature when permissionDenied is false', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'ENABLING_FEATURE', blogId: 1 };
			const next = wizardReducer( state, {
				type: 'ENABLE_STEP_FAILED',
				step: 'feature',
				message: 'failed',
				permissionDenied: false,
			} );
			expect( next.name ).toBe( 'ERROR' );
			expect( next.errorStep ).toBe( 'enable_feature' );
			expect( next.errorMessage ).toBe( 'failed' );
		} );

		it( 'moves to ERROR with errorStep enable_c2s when step is c2s', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'ENABLING_C2S', blogId: 1 };
			const next = wizardReducer( state, {
				type: 'ENABLE_STEP_FAILED',
				step: 'c2s',
				message: 'c2s failed',
				permissionDenied: false,
			} );
			expect( next.name ).toBe( 'ERROR' );
			expect( next.errorStep ).toBe( 'enable_c2s' );
		} );

		it( 'moves to ERROR with errorStep enable_user_actors when step is user_actors', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'ENABLING_USER_ACTORS', blogId: 1 };
			const next = wizardReducer( state, {
				type: 'ENABLE_STEP_FAILED',
				step: 'user_actors',
				message: 'actors failed',
				permissionDenied: false,
			} );
			expect( next.name ).toBe( 'ERROR' );
			expect( next.errorStep ).toBe( 'enable_user_actors' );
		} );
	} );

	describe( 'AUTHORIZE_DONE', () => {
		it( 'stores authorizeUrl and moves to REDIRECTING', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'AUTHORIZING', blogId: 1 };
			const next = wizardReducer( state, {
				type: 'AUTHORIZE_DONE',
				authorizeUrl: 'https://example.com/oauth/authorize',
			} );
			expect( next.name ).toBe( 'REDIRECTING' );
			expect( next.authorizeUrl ).toBe( 'https://example.com/oauth/authorize' );
		} );
	} );

	describe( 'AUTHORIZE_FAILED', () => {
		it( 'moves to ERROR with errorStep authorize', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'AUTHORIZING', blogId: 1 };
			const next = wizardReducer( state, {
				type: 'AUTHORIZE_FAILED',
				message: 'auth failed',
			} );
			expect( next.name ).toBe( 'ERROR' );
			expect( next.errorStep ).toBe( 'authorize' );
			expect( next.errorMessage ).toBe( 'auth failed' );
		} );
	} );

	describe( 'COMPLETE_DONE', () => {
		it( 'moves to DONE', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'COMPLETING', blogId: 1 };
			const next = wizardReducer( state, { type: 'COMPLETE_DONE' } );
			expect( next.name ).toBe( 'DONE' );
		} );
	} );

	describe( 'COMPLETE_FAILED', () => {
		it( 'moves to ERROR with errorStep complete', () => {
			const state: WizardState = { ...INITIAL_STATE, name: 'COMPLETING', blogId: 1 };
			const next = wizardReducer( state, {
				type: 'COMPLETE_FAILED',
				message: 'completion failed',
			} );
			expect( next.name ).toBe( 'ERROR' );
			expect( next.errorStep ).toBe( 'complete' );
			expect( next.errorMessage ).toBe( 'completion failed' );
		} );
	} );

	describe( 'RETRY_FROM_ERROR', () => {
		it( 'returns unchanged state when blogId is null', () => {
			const state: WizardState = {
				...INITIAL_STATE,
				name: 'ERROR',
				blogId: null,
				errorStep: 'capability_check',
				errorMessage: 'failed',
			};
			const next = wizardReducer( state, { type: 'RETRY_FROM_ERROR' } );
			expect( next ).toBe( state );
		} );

		it( 'moves to CHECKING_CAPABILITIES and clears errors when blogId is set', () => {
			const state: WizardState = {
				...INITIAL_STATE,
				name: 'ERROR',
				blogId: 7,
				capabilities: makeCaps(),
				errorStep: 'capability_check',
				errorMessage: 'network error',
			};
			const next = wizardReducer( state, { type: 'RETRY_FROM_ERROR' } );
			expect( next.name ).toBe( 'CHECKING_CAPABILITIES' );
			expect( next.errorStep ).toBeNull();
			expect( next.errorMessage ).toBeNull();
			expect( next.capabilities ).toBeNull();
			expect( next.blogId ).toBe( 7 );
		} );
	} );

	describe( 'RESET', () => {
		it( 'returns INITIAL_STATE', () => {
			const state: WizardState = {
				name: 'DONE',
				blogId: 123,
				capabilities: makeCaps(),
				authorizeUrl: 'https://example.com',
				errorStep: null,
				errorMessage: null,
			};
			const next = wizardReducer( state, { type: 'RESET' } );
			expect( next ).toEqual( INITIAL_STATE );
		} );
	} );

	describe( 'unknown actions', () => {
		it( 'returns state unchanged for unknown action types', () => {
			// @ts-expect-error testing runtime behavior with invalid action
			const next = wizardReducer( INITIAL_STATE, { type: 'UNKNOWN_ACTION' } );
			expect( next ).toBe( INITIAL_STATE );
		} );
	} );
} );
