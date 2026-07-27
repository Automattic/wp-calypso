/**
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://my.localhost/" }
 */

import { disable, enable } from '@automattic/calypso-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useExperiment } from 'calypso/lib/explat';
import {
	RESURRECTED_FREE_USERS_EXPERIMENT,
	WELCOME_BACK_MODAL_FORCE_FLAG,
	WELCOME_BACK_VARIATION_MANUAL,
} from '../constants';
import { useResurrectedFreeUserEligibility } from '../use-resurrected-free-user-eligibility';
import type { ReactNode } from 'react';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseExperiment = jest.mocked( useExperiment );
const DAY_IN_SECONDS = 24 * 60 * 60;

function timestampDaysAgo( days: number ): number {
	return Math.floor( Date.now() / 1000 ) - days * DAY_IN_SECONDS;
}

function mockUserSettings( lastAdminActivityTimestamp: number | string ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, {
			last_admin_activity_timestamp: lastAdminActivityTimestamp,
		} );
}

function mockPurchases( purchases: object[] = [] ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases );
}

function makePurchase( {
	expiryStatus,
	isDomainRegistration = false,
}: {
	expiryStatus: string;
	isDomainRegistration?: boolean;
} ) {
	return {
		ID: 1,
		ownership_id: 1,
		product_id: 1,
		blog_id: 1,
		user_id: 1,
		is_domain: isDomainRegistration,
		is_domain_registration: isDomainRegistration,
		expiry_status: expiryStatus,
	};
}

function createExperimentAssignment( variationName: string ) {
	return {
		experimentName: RESURRECTED_FREE_USERS_EXPERIMENT,
		variationName,
		retrievedTimestamp: Date.now(),
		ttl: 60,
	};
}

function renderEligibilityHook() {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return renderHook( () => useResurrectedFreeUserEligibility(), { wrapper } );
}

describe( 'useResurrectedFreeUserEligibility', () => {
	beforeEach( () => {
		disable( WELCOME_BACK_MODAL_FORCE_FLAG );
		mockUseExperiment.mockReturnValue( [ false, null ] );
	} );

	afterEach( () => {
		disable( WELCOME_BACK_MODAL_FORCE_FLAG );
		jest.clearAllMocks();
	} );

	test( 'returns an assigned variation for an eligible resurrected user', async () => {
		mockUserSettings( timestampDaysAgo( 200 ) );
		mockPurchases();
		mockUseExperiment.mockReturnValue( [
			false,
			createExperimentAssignment( 'treatment_content' ),
		] );

		const { result } = renderEligibilityHook();

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( result.current ).toEqual( {
			isLoading: false,
			isResurrectedSixMonths: true,
			hasActivePaidSubscription: false,
			isEligible: true,
			variationName: 'treatment_content',
			isForcedVariation: false,
		} );
		expect( mockUseExperiment ).toHaveBeenLastCalledWith( RESURRECTED_FREE_USERS_EXPERIMENT, {
			isEligible: true,
		} );
	} );

	test( 'accepts a numeric-string activity timestamp', async () => {
		mockUserSettings( String( timestampDaysAgo( 200 ) ) );
		mockPurchases();

		const { result } = renderEligibilityHook();

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( result.current.isResurrectedSixMonths ).toBe( true );
		expect( result.current.isEligible ).toBe( true );
		expect( result.current.variationName ).toBe( WELCOME_BACK_VARIATION_MANUAL );
	} );

	test( 'does not assign a recent user to the experiment', async () => {
		mockUserSettings( timestampDaysAgo( 30 ) );
		mockPurchases();

		const { result } = renderEligibilityHook();

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( result.current.isResurrectedSixMonths ).toBe( false );
		expect( result.current.isEligible ).toBe( false );
		expect( mockUseExperiment ).toHaveBeenLastCalledWith( RESURRECTED_FREE_USERS_EXPERIMENT, {
			isEligible: false,
		} );
	} );

	test( 'does not assign a user with an invalid activity timestamp', async () => {
		mockUserSettings( 'invalid' );
		mockPurchases();

		const { result } = renderEligibilityHook();

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( result.current.isResurrectedSixMonths ).toBe( false );
		expect( result.current.isEligible ).toBe( false );
	} );

	test.each( [ 'active', 'auto-renewing' ] )(
		'does not assign a user with an %s subscription',
		async ( expiryStatus ) => {
			mockUserSettings( timestampDaysAgo( 200 ) );
			mockPurchases( [ makePurchase( { expiryStatus } ) ] );

			const { result } = renderEligibilityHook();

			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

			expect( result.current.hasActivePaidSubscription ).toBe( true );
			expect( result.current.isEligible ).toBe( false );
		}
	);

	test( 'ignores renewing domain registrations', async () => {
		mockUserSettings( timestampDaysAgo( 200 ) );
		mockPurchases( [
			makePurchase( {
				expiryStatus: 'active',
				isDomainRegistration: true,
			} ),
		] );

		const { result } = renderEligibilityHook();

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( result.current.hasActivePaidSubscription ).toBe( false );
		expect( result.current.isEligible ).toBe( true );
	} );

	test( 'waits for the experiment assignment when base eligibility is met', async () => {
		mockUserSettings( timestampDaysAgo( 200 ) );
		mockPurchases();
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderEligibilityHook();

		await waitFor( () => {
			expect( result.current.isResurrectedSixMonths ).toBe( true );
			expect( result.current.hasActivePaidSubscription ).toBe( false );
		} );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.isEligible ).toBe( false );
	} );

	test( 'fails closed when eligibility data cannot be loaded', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/settings' )
			.query( true )
			.reply( 500 );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/upgrades' )
			.query( true )
			.reply( 500 );

		const { result } = renderEligibilityHook();

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( result.current.isEligible ).toBe( false );
		expect( result.current.hasActivePaidSubscription ).toBeNull();
	} );

	test( 'forces eligibility with the local development flag', async () => {
		enable( WELCOME_BACK_MODAL_FORCE_FLAG );
		mockUserSettings( timestampDaysAgo( 30 ) );
		mockPurchases( [ makePurchase( { expiryStatus: 'active' } ) ] );

		const { result } = renderEligibilityHook();

		await waitFor( () => expect( result.current.hasActivePaidSubscription ).toBe( true ) );

		expect( result.current.isLoading ).toBe( false );
		expect( result.current.isEligible ).toBe( true );
		expect( result.current.variationName ).toBe( WELCOME_BACK_VARIATION_MANUAL );
		expect( result.current.isForcedVariation ).toBe( true );
	} );
} );
