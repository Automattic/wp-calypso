/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePlanTypeDestinationCallback from '../use-plan-type-destination-callback';
import type { PlanTypeSelectorProps } from '@automattic/plans-grid-next';

const SITE_SLUG = 'example.wordpress.com';

/**
 * Switch the billing term while on `currentUrl` and return what the callback builds: a plans URL,
 * or in signup and the Stepper upgrade flow, a query string for the current path.
 */
function switchTerm(
	currentUrl: string,
	intervalType: string,
	props: Partial< PlanTypeSelectorProps > = {}
): string {
	window.history.replaceState( null, '', currentUrl );
	const { result } = renderHook( () => usePlanTypeDestinationCallback() );

	return result.current( { siteSlug: SITE_SLUG, ...props }, { intervalType } );
}

describe( 'usePlanTypeDestinationCallback', () => {
	describe( 'on the plans page', () => {
		it.each( [ 'monthly', 'yearly', '2yearly', '3yearly' ] )(
			'keeps source and ai_session_id when switching to %s',
			( intervalType ) => {
				const url = new URL(
					switchTerm(
						`/plans/yearly/${ SITE_SLUG }?source=wp_ai_credits&ai_session_id=abc123`,
						intervalType
					),
					'https://wordpress.com'
				);

				expect( url.pathname ).toBe( `/plans/${ intervalType }/${ SITE_SLUG }` );
				expect( Object.fromEntries( url.searchParams ) ).toEqual( {
					source: 'wp_ai_credits',
					ai_session_id: 'abc123',
				} );
			}
		);

		it( 'keeps redirect_to, plugin, coupon, feature and plan alongside the attribution', () => {
			const url = new URL(
				switchTerm(
					`/plans/yearly/${ SITE_SLUG }?redirect_to=%2Fhome&plugin=woocommerce&source=wp_ai_credits&ai_session_id=abc123`,
					'3yearly',
					{ coupon: 'SAVE10', selectedFeature: 'some-feature', selectedPlan: 'business-bundle' }
				),
				'https://wordpress.com'
			);

			expect( url.pathname ).toBe( `/plans/3yearly/${ SITE_SLUG }` );
			expect( Object.fromEntries( url.searchParams ) ).toEqual( {
				coupon: 'SAVE10',
				feature: 'some-feature',
				plan: 'business-bundle',
				redirect_to: '/home',
				plugin: 'woocommerce',
				source: 'wp_ai_credits',
				ai_session_id: 'abc123',
			} );
		} );

		it( 'keeps only the attribution that is present', () => {
			const url = new URL(
				switchTerm( `/plans/yearly/${ SITE_SLUG }?source=wp_ai_credits&ai_session_id=`, '3yearly' ),
				'https://wordpress.com'
			);

			expect( Object.fromEntries( url.searchParams ) ).toEqual( { source: 'wp_ai_credits' } );
		} );

		it( 'adds no attribution when none arrived', () => {
			const url = new URL(
				switchTerm( `/plans/yearly/${ SITE_SLUG }`, '3yearly' ),
				'https://wordpress.com'
			);

			expect( Object.fromEntries( url.searchParams ) ).toEqual( {} );
		} );
	} );

	describe.each( [
		[ 'signup', { isInSignup: true } ],
		[ 'the Stepper upgrade flow', { isStepperUpgradeFlow: true } ],
	] )( 'in %s, which builds on the current query', ( _flow, flowProps ) => {
		it( 'still keeps source and ai_session_id', () => {
			const query = switchTerm(
				'/setup/plan-upgrade/plans?siteSlug=example.wordpress.com&source=wp_ai_credits&ai_session_id=abc123',
				'3yearly',
				{ ...flowProps, coupon: 'SAVE10' }
			);

			expect( Object.fromEntries( new URLSearchParams( query ) ) ).toEqual( {
				siteSlug: SITE_SLUG,
				coupon: 'SAVE10',
				intervalType: '3yearly',
				source: 'wp_ai_credits',
				ai_session_id: 'abc123',
			} );
		} );

		it( 'adds no attribution when none arrived', () => {
			const query = switchTerm(
				'/setup/plan-upgrade/plans?siteSlug=example.wordpress.com',
				'3yearly',
				flowProps
			);

			expect( Object.fromEntries( new URLSearchParams( query ) ) ).toEqual( {
				siteSlug: SITE_SLUG,
				intervalType: '3yearly',
			} );
		} );
	} );
} );
