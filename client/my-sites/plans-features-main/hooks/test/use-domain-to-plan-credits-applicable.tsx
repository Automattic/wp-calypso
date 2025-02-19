/**
 * @jest-environment jsdom
 */

import { SitePlan, useSitePlans } from '@automattic/data-stores/src/plans';
import { COST_OVERRIDE_REASONS } from '@automattic/data-stores/src/plans/constants';
import { UseQueryResult } from '@tanstack/react-query';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { useMaxPlanUpgradeCredits } from 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits';
import { hasPurchasedDomain } from 'calypso/state/purchases/selectors/has-purchased-domain';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits', () => ( {
	useMaxPlanUpgradeCredits: jest.fn(),
} ) );

jest.mock( 'calypso/state/purchases/selectors/has-purchased-domain', () => ( {
	hasPurchasedDomain: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	isCurrentPlanPaid: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores/src/plans/queries/use-site-plans', () => jest.fn() );

const mockUseMaxPlanUpgradeCredits = useMaxPlanUpgradeCredits as jest.MockedFunction<
	typeof useMaxPlanUpgradeCredits
>;
const mockHasPurchasedDomain = hasPurchasedDomain as jest.MockedFunction<
	typeof hasPurchasedDomain
>;
const mockIsCurrentPlanPaid = isCurrentPlanPaid as jest.MockedFunction< typeof isCurrentPlanPaid >;
const mockUseSitePlans = useSitePlans as jest.MockedFunction< typeof useSitePlans >;
const siteId = 1;
const overrideCode = COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION;

describe( 'useDomainToPlanCreditsApplicable', () => {
	beforeEach( () => {
		jest.resetAllMocks();

		mockUseMaxPlanUpgradeCredits.mockImplementation( () => 1000 );
		mockHasPurchasedDomain.mockImplementation( () => true );
		mockIsCurrentPlanPaid.mockImplementation( () => false );
		mockUseSitePlans.mockImplementation(
			() =>
				( {
					data: { free_plan: { pricing: { costOverrides: [ { overrideCode } ] } } },
				} ) as unknown as UseQueryResult< { [ planSlug: string ]: SitePlan } >
		);
	} );

	test( 'Returns the credit value for a site that is eligible (has a domain and is on the free plan)', () => {
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( 1000 );
	} );

	test( "Returns null when the site is not eligible because it doesn't have a domain)", () => {
		mockHasPurchasedDomain.mockImplementation( () => false );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( null );
	} );

	test( 'Returns null when the site is not eligible because it is on a paid plan', () => {
		mockIsCurrentPlanPaid.mockImplementation( () => true );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( null );
	} );

	test( 'Returns null when the site is not eligible because the upgrade credit is not for domain proration', () => {
		mockUseSitePlans.mockImplementation(
			() =>
				( {
					data: { free_plan: { pricing: { costOverrides: [] } } },
				} ) as unknown as UseQueryResult< { [ planSlug: string ]: SitePlan } >
		);
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( null );
	} );

	test( 'Returns 0 (rather than null) for for a site that is eligible and has a credit value of 0', () => {
		// ie. distinguishes between a site having zero credits, and a site being ineligible for credits (returning null)
		mockUseMaxPlanUpgradeCredits.mockImplementation( () => 0 );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( 0 );
	} );
} );
