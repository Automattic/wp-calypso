/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { getPurchasesError } from 'calypso/state/purchases/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';
import useStatsPurchases from '../../../hooks/use-stats-purchases';
import useIsPricingGridEligible from '../use-eligibility';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( ( selector ) => selector( {} ) ),
} ) );
jest.mock( 'calypso/state/purchases/selectors' );
jest.mock( 'calypso/state/sites/selectors' );
jest.mock( '../../../hooks/use-stats-purchases' );

const SITE_ID = 123;
const POST_LAUNCH_DATE = '2026-09-01T00:00:00+00:00';
const PRE_LAUNCH_DATE = '2026-01-01T00:00:00+00:00';

function mockSite( {
	connectedAt = POST_LAUNCH_DATE as string | number | null,
	hasAnyPlan = false,
	isLoadingPurchases = false,
	purchasesError = null as object | null,
} = {} ) {
	( getSiteOption as jest.Mock ).mockReturnValue( connectedAt );
	( getPurchasesError as unknown as jest.Mock ).mockReturnValue( purchasesError );
	( useStatsPurchases as jest.Mock ).mockReturnValue( {
		hasAnyPlan,
		isLoading: isLoadingPurchases,
	} );
}

describe( 'useIsPricingGridEligible', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'is eligible for a newly connected site without a plan', () => {
		mockSite();

		const { result } = renderHook( () => useIsPricingGridEligible( SITE_ID ) );

		expect( result.current ).toEqual( {
			isEligible: true,
			isNewConnection: true,
			isLoading: false,
		} );
	} );

	it( 'is not eligible for a site connected before launch', () => {
		mockSite( { connectedAt: PRE_LAUNCH_DATE } );

		const { result } = renderHook( () => useIsPricingGridEligible( SITE_ID ) );

		expect( result.current.isEligible ).toBe( false );
		expect( result.current.isNewConnection ).toBe( false );
	} );

	it( 'is not eligible when the site already holds a Stats plan', () => {
		mockSite( { hasAnyPlan: true } );

		const { result } = renderHook( () => useIsPricingGridEligible( SITE_ID ) );

		expect( result.current.isEligible ).toBe( false );
	} );

	it( 'fails closed when the purchases fetch errored', () => {
		mockSite( { purchasesError: { error: 'fetch_failed' } } );

		const { result } = renderHook( () => useIsPricingGridEligible( SITE_ID ) );

		expect( result.current.isEligible ).toBe( false );
	} );

	it( 'accepts a connection date given as unix seconds', () => {
		mockSite( { connectedAt: Date.parse( POST_LAUNCH_DATE ) / 1000 } );

		const { result } = renderHook( () => useIsPricingGridEligible( SITE_ID ) );

		expect( result.current.isNewConnection ).toBe( true );
	} );

	it( 'is not eligible when the connection date is missing', () => {
		mockSite( { connectedAt: null } );

		const { result } = renderHook( () => useIsPricingGridEligible( SITE_ID ) );

		expect( result.current.isEligible ).toBe( false );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'only reports loading for newly connected sites', () => {
		mockSite( { isLoadingPurchases: true } );

		const { result } = renderHook( () => useIsPricingGridEligible( SITE_ID ) );

		expect( result.current.isLoading ).toBe( true );

		mockSite( { connectedAt: PRE_LAUNCH_DATE, isLoadingPurchases: true } );

		const { result: preLaunch } = renderHook( () => useIsPricingGridEligible( SITE_ID ) );

		expect( preLaunch.current.isLoading ).toBe( false );
	} );
} );
