/**
 * @jest-environment jsdom
 */

import { SitePlan, useSitePlans } from '@automattic/data-stores/src/plans';
import { COST_OVERRIDE_REASONS } from '@automattic/data-stores/src/plans/constants';
import { UseQueryResult } from '@tanstack/react-query';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { useMaxPlanUpgradeCredits } from 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits', () => ( {
	useMaxPlanUpgradeCredits: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores/src/plans/queries/use-site-plans', () => jest.fn() );

const siteId = 1;
const overrideCode = COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION;

describe( 'useDomainToPlanCreditsApplicable', () => {
	beforeEach( () => {
		jest.mocked( useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: { costOverrides: [ { overrideCode } ] },
				},
			},
		} as UseQueryResult< { free_plan: SitePlan } > );
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
	} );

	test( 'Returns the credit value for a site that has domain-to-plan credit', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 1000 );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( 1000 );
	} );

	test( 'Returns null for a site that has credit but not domain-to-plan credit', () => {
		jest.mocked( useSitePlans ).mockReturnValue( {
			data: {
				free_plan: {
					pricing: { costOverrides: [ { overrideCode: 'some-other-override' } ] },
				},
			},
		} as UseQueryResult< { free_plan: SitePlan } > );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( null );
	} );

	test( 'Returns 0 (not null) for a site that has domain-to-plan credit value of 0', () => {
		jest.mocked( useMaxPlanUpgradeCredits ).mockReturnValue( 0 );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( 0 );
	} );
} );
