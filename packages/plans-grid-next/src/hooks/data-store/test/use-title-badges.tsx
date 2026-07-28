/**
 * @jest-environment jsdom
 */

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

// isWooHostedBasicPlan drives the only built-in title badge; mock it so we can
// exercise the "override wins over the computed default" path without pulling
// the heavy calypso-products chain into the test.
jest.mock( '@automattic/calypso-products', () => ( {
	isWooHostedBasicPlan: ( planSlug: string ) => planSlug === 'business-bundle',
} ) );

import useTitleBadges from '../use-title-badges';
import type { PlanSlug } from '@automattic/calypso-products';

const BUSINESS = 'business-bundle' as PlanSlug;
const PREMIUM = 'value_bundle' as PlanSlug;

describe( 'useTitleBadges', () => {
	it( 'applies a per-plan badge override', () => {
		expect(
			useTitleBadges( {
				planSlugs: [ BUSINESS, PREMIUM ],
				badgeTextOverrides: { [ PREMIUM ]: 'Team favorite' },
			} )
		).toEqual( {
			[ BUSINESS ]: null,
			[ PREMIUM ]: 'Team favorite',
		} );
	} );

	it( 'returns null for plans with no override and no computed badge', () => {
		expect( useTitleBadges( { planSlugs: [ PREMIUM ] } ) ).toEqual( {
			[ PREMIUM ]: null,
		} );
	} );

	it( 'lets the override win over the computed default badge', () => {
		// Without an override, the woo-hosted intent would compute "Recommended"
		// for the business plan; the override must take precedence.
		expect(
			useTitleBadges( {
				intent: 'plans-woo-hosted',
				planSlugs: [ BUSINESS ],
				badgeTextOverrides: { [ BUSINESS ]: 'Best for stores' },
			} )
		).toEqual( {
			[ BUSINESS ]: 'Best for stores',
		} );
	} );

	it( 'keeps the computed default when there is no override', () => {
		expect( useTitleBadges( { intent: 'plans-woo-hosted', planSlugs: [ BUSINESS ] } ) ).toEqual( {
			[ BUSINESS ]: 'Recommended',
		} );
	} );
} );
