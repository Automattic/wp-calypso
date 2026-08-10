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

	describe( 'onboarding flow blueprint param (legacy behavior)', () => {
		it( 'does not special-case the blueprint param — legacy default plans grid', () => {
			window.history.replaceState( {}, '', '/?blueprint=945' );
			expect( getPlansIntent( ONBOARDING_FLOW ) ).toBeNull();
		} );

		it( 'uses the playground intent when the playground param is present alongside blueprint', () => {
			// The Playground flow enters via /setup/onboarding/playground/?blueprint=<id>,
			// so its users reach the plans step carrying BOTH params.
			window.history.replaceState( {}, '', '/?blueprint=123&playground=abc' );
			expect( getPlansIntent( ONBOARDING_FLOW ) ).toBe( 'plans-playground' );
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
