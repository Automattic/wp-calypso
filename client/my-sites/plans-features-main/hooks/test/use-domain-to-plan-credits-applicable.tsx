/**
 * @jest-environment jsdom
 */

import { useDomainToPlanCredits } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { hasPurchasedDomain } from 'calypso/state/purchases/selectors/has-purchased-domain';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits', () => ( {
	useDomainToPlanCredits: jest.fn(),
} ) );

jest.mock( 'calypso/state/purchases/selectors/has-purchased-domain', () => ( {
	hasPurchasedDomain: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	isCurrentPlanPaid: jest.fn(),
} ) );

const mockUseDomainToPlanCredits = useDomainToPlanCredits as jest.MockedFunction<
	typeof useDomainToPlanCredits
>;
const mockHasPurchasedDomain = hasPurchasedDomain as jest.MockedFunction<
	typeof hasPurchasedDomain
>;
const mockIsCurrentPlanPaid = isCurrentPlanPaid as jest.MockedFunction< typeof isCurrentPlanPaid >;
const siteId = 1;

describe( 'usePlanUpgradeCreditsApplicable', () => {
	beforeEach( () => {
		jest.resetAllMocks();

		mockUseDomainToPlanCredits.mockImplementation( () => 100 );
		mockHasPurchasedDomain.mockImplementation( () => true );
		mockIsCurrentPlanPaid.mockImplementation( () => false );
	} );

	test( 'Returns credit when site has a domain, is on a free plan, and has credits', () => {
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( 100 );
	} );

	test( 'Returns credit when credit value is 0', () => {
		mockUseDomainToPlanCredits.mockImplementation( () => 0 );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( 0 );
	} );

	test( 'Returns null when credit value is null', () => {
		mockUseDomainToPlanCredits.mockImplementation( () => null );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( null );
	} );

	test( 'Returns null when site has no domain', () => {
		mockHasPurchasedDomain.mockImplementation( () => false );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( null );
	} );

	test( 'Returns null when site is on a paid plan', () => {
		mockIsCurrentPlanPaid.mockImplementation( () => true );
		const { result } = renderHookWithProvider( () => useDomainToPlanCreditsApplicable( siteId ) );
		expect( result.current ).toEqual( null );
	} );
} );
