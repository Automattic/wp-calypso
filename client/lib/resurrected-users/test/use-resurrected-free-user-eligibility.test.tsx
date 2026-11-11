/**
 * @jest-environment jsdom
 */
import { disable, enable } from '@automattic/calypso-config';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { useExperiment } from 'calypso/lib/explat';
import userSettingsReducer from 'calypso/state/user-settings/reducer';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import {
	RESURRECTED_FREE_USERS_EXPERIMENT,
	WELCOME_BACK_90_DAY_ELIGIBILITY_FLAG,
	WELCOME_BACK_MODAL_FORCE_FLAG,
	WELCOME_BACK_VARIATION_MANUAL,
	WELCOME_BACK_VARIATIONS,
} from '../constants';
import { useResurrectedFreeUserEligibility } from '../use-resurrected-free-user-eligibility';
import type { ExperimentAssignment } from '@automattic/explat-client';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseExperiment = useExperiment as jest.MockedFunction< typeof useExperiment >;

const DAY_IN_SECONDS = 24 * 60 * 60;

const mockPurchases = ( purchases: object[] = [] ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases );

const activeSubscription = {
	ID: 1,
	ownership_id: 1,
	product_id: 1,
	product_slug: 'business-bundle',
	blog_id: 1,
	user_id: 1,
	is_domain: false,
	is_domain_registration: false,
	expiry_status: 'auto-renewing',
};

const createExperimentAssignment = ( variationName: string ): ExperimentAssignment => ( {
	experimentName: RESURRECTED_FREE_USERS_EXPERIMENT,
	variationName,
	retrievedTimestamp: Date.now(),
	ttl: 60,
} );

const reducers = {
	userSettings: userSettingsReducer,
};

const createState = ( {
	lastSeenOffsetDays = 400,
	fetchingUserSettings = false,
}: {
	lastSeenOffsetDays?: number;
	fetchingUserSettings?: boolean;
} = {} ) => {
	const nowInSeconds = Math.floor( Date.now() / 1000 );

	return {
		currentUser: {
			id: 123,
			user: {},
			flags: [],
		},
		userSettings: {
			settings: {
				last_admin_activity_timestamp: nowInSeconds - lastSeenOffsetDays * DAY_IN_SECONDS,
			},
			fetching: fetchingUserSettings,
		},
	};
};

const renderEligibilityHook = ( initialState: object ) =>
	renderHookWithProvider( () => useResurrectedFreeUserEligibility(), {
		initialState,
		reducers,
	} );

describe( 'useResurrectedFreeUserEligibility', () => {
	beforeEach( () => {
		disable( WELCOME_BACK_90_DAY_ELIGIBILITY_FLAG );
		disable( WELCOME_BACK_MODAL_FORCE_FLAG );
		mockUseExperiment.mockReturnValue( [ false, null ] );
		mockUseExperiment.mockClear();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'reports loading until the user purchases have been fetched', async () => {
		mockPurchases();

		const { result } = renderEligibilityHook( createState( { lastSeenOffsetDays: 200 } ) );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.hasActivePaidSubscription ).toBeNull();

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.hasActivePaidSubscription ).toBe( false );
	} );

	it( 'does not mark the user as eligible when active subscriptions exist', async () => {
		mockPurchases( [ activeSubscription ] );

		const { result } = renderEligibilityHook( createState( { lastSeenOffsetDays: 400 } ) );

		await waitFor( () => expect( result.current.hasActivePaidSubscription ).toBe( true ) );
		expect( result.current.isEligible ).toBe( false );
		expect( result.current.isForcedVariation ).toBe( false );
		expect( mockUseExperiment ).toHaveBeenCalledWith( RESURRECTED_FREE_USERS_EXPERIMENT, {
			isEligible: false,
		} );
	} );

	it( 'returns MANUAL variation when resurrected and free of active subscriptions', async () => {
		mockPurchases();

		const { result } = renderEligibilityHook( createState( { lastSeenOffsetDays: 400 } ) );

		await waitFor( () => expect( result.current.isEligible ).toBe( true ) );
		expect( result.current.isResurrectedSixMonths ).toBe( true );
		expect( result.current.isResurrectedThreeMonths ).toBe( true );
		expect( result.current.hasActivePaidSubscription ).toBe( false );
		expect( result.current.variationName ).toBe( WELCOME_BACK_VARIATION_MANUAL );
		expect( result.current.isLoading ).toBe( false );
		expect( result.current.isForcedVariation ).toBe( false );
		expect( mockUseExperiment ).toHaveBeenCalledWith( RESURRECTED_FREE_USERS_EXPERIMENT, {
			isEligible: true,
		} );
	} );

	it( 'uses the 180-day threshold when 90-day eligibility is disabled', async () => {
		mockPurchases();

		const { result } = renderEligibilityHook( createState( { lastSeenOffsetDays: 100 } ) );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.isResurrectedSixMonths ).toBe( false );
		expect( result.current.isResurrectedThreeMonths ).toBe( true );
		expect( result.current.isEligible ).toBe( false );
	} );

	it( 'uses the 90-day threshold when 90-day eligibility is enabled', async () => {
		enable( WELCOME_BACK_90_DAY_ELIGIBILITY_FLAG );
		mockPurchases();

		const { result } = renderEligibilityHook( createState( { lastSeenOffsetDays: 100 } ) );

		await waitFor( () => expect( result.current.isEligible ).toBe( true ) );
		expect( result.current.isResurrectedSixMonths ).toBe( false );
		expect( result.current.isResurrectedThreeMonths ).toBe( true );
	} );

	it( 'returns the assigned experiment variation for an eligible user', async () => {
		mockPurchases();
		mockUseExperiment.mockReturnValue( [
			false,
			createExperimentAssignment( WELCOME_BACK_VARIATIONS.content ),
		] );

		const { result } = renderEligibilityHook( createState( { lastSeenOffsetDays: 400 } ) );

		await waitFor( () => expect( result.current.isEligible ).toBe( true ) );
		expect( result.current.variationName ).toBe( WELCOME_BACK_VARIATIONS.content );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'waits for the experiment assignment for an eligible user', async () => {
		mockPurchases();
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderEligibilityHook( createState( { lastSeenOffsetDays: 400 } ) );

		await waitFor( () => expect( result.current.hasActivePaidSubscription ).toBe( false ) );
		expect( result.current.isEligible ).toBe( false );
		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'forces eligibility when welcome-back-modal-manual flag is enabled', () => {
		enable( WELCOME_BACK_MODAL_FORCE_FLAG );
		mockPurchases();

		const { result } = renderEligibilityHook( createState( { lastSeenOffsetDays: 30 } ) );

		expect( result.current.isEligible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
		expect( result.current.variationName ).toBe( WELCOME_BACK_VARIATION_MANUAL );
		expect( result.current.isForcedVariation ).toBe( true );
		expect( mockUseExperiment ).toHaveBeenCalledWith( RESURRECTED_FREE_USERS_EXPERIMENT, {
			isEligible: false,
		} );
	} );
} );
