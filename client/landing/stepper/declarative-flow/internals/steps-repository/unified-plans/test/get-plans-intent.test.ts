/**
 * @jest-environment jsdom
 */
import { ONBOARDING_FLOW, PLAN_UPGRADE_FLOW } from '@automattic/onboarding';
import { getPlansIntent } from '../util/get-plans-intent';

describe( 'getPlansIntent', () => {
	afterEach( () => {
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'maps the ai-site-builder-onboarding flow to the four paid plans intent', () => {
		expect( getPlansIntent( 'ai-site-builder-onboarding' ) ).toBe( 'plans-ai-assembler-paid-only' );
	} );

	describe( 'onboarding flow blueprint variation', () => {
		it( 'maps to the four paid plans intent when a blueprint param is present', () => {
			window.history.replaceState( {}, '', '/?blueprint=coachava' );
			expect( getPlansIntent( ONBOARDING_FLOW ) ).toBe( 'plans-ai-assembler-paid-only' );
		} );

		it( 'does not force the paid-only intent for a plain onboarding flow', () => {
			expect( getPlansIntent( ONBOARDING_FLOW ) ).toBeNull();
		} );
	} );

	describe( 'plan-upgrade flow (dashboard "Change plan" downgrade entry point)', () => {
		it( 'maps to the upgrade-or-downgrade intent when allow_downgrade=true', () => {
			window.history.replaceState( {}, '', '/?allow_downgrade=true' );
			expect( getPlansIntent( PLAN_UPGRADE_FLOW ) ).toBe( 'plans-upgrade-or-downgrade' );
		} );

		it( 'maps to the upgrade-only intent when allow_downgrade is absent', () => {
			expect( getPlansIntent( PLAN_UPGRADE_FLOW ) ).toBe( 'plans-upgrade' );
		} );

		it( 'maps to the upgrade-only intent when allow_downgrade is not exactly "true"', () => {
			window.history.replaceState( {}, '', '/?allow_downgrade=false' );
			expect( getPlansIntent( PLAN_UPGRADE_FLOW ) ).toBe( 'plans-upgrade' );
		} );
	} );
} );
