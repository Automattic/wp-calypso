/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { waitFor } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import userSettingsReducer from 'calypso/state/user-settings/reducer';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { WELCOME_BACK_VARIATIONS } from '../constants';
import { useResurrectedFreeUserEligibility } from '../use-resurrected-free-user-eligibility';
import type { ExperimentAssignment } from '@automattic/explat-client';

const selectorsState = {
	purchases: null as Array< { type: string; status: string } > | null,
	hasLoaded: false,
	isFetching: false,
};

jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn() as jest.Mock & {
		isEnabled: jest.Mock;
	};
	mockConfig.isEnabled = jest.fn().mockReturnValue( true );
	return {
		__esModule: true,
		default: mockConfig,
	};
} );

jest.mock( 'calypso/state/purchases/selectors', () => ( {
	getUserPurchases: () => selectorsState.purchases,
	hasLoadedUserPurchasesFromServer: () => selectorsState.hasLoaded,
	isFetchingUserPurchases: () => selectorsState.isFetching,
} ) );

jest.mock( 'calypso/lib/purchases', () => ( {
	isSubscription: ( purchase: { type: string } ) => purchase.type === 'subscription',
	isRenewing: ( purchase: { status: string } ) => purchase.status === 'active',
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

jest.mock( 'calypso/state/purchases/actions', () => ( {
	fetchUserPurchases: jest.fn( () => () => Promise.resolve( [] ) ),
} ) );

const mockUseExperiment = useExperiment as jest.MockedFunction< typeof useExperiment >;
const mockFetchUserPurchases = fetchUserPurchases as jest.MockedFunction<
	typeof fetchUserPurchases
>;
const mockIsFeatureEnabled = config.isEnabled as jest.MockedFunction< typeof config.isEnabled >;

const DAY_IN_SECONDS = 24 * 60 * 60;

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

describe( 'useResurrectedFreeUserEligibility', () => {
	beforeEach( () => {
		selectorsState.purchases = null;
		selectorsState.hasLoaded = false;
		selectorsState.isFetching = false;
		mockUseExperiment.mockReturnValue( [ false, null ] );
		mockIsFeatureEnabled.mockReturnValue( false );
		mockFetchUserPurchases.mockImplementation( () => () => Promise.resolve( [] ) );
		mockFetchUserPurchases.mockClear();
	} );

	it( 'requests user purchases when they have not loaded yet', async () => {
		const initialState = createState( { lastSeenOffsetDays: 200 } );

		renderHookWithProvider( () => useResurrectedFreeUserEligibility(), {
			initialState,
			reducers,
		} );

		await waitFor( () =>
			expect( fetchUserPurchases ).toHaveBeenCalledWith( initialState.currentUser.id )
		);
	} );

	it( 'does not mark the user as eligible when active subscriptions exist', () => {
		selectorsState.purchases = [ { type: 'subscription', status: 'active' } ];
		selectorsState.hasLoaded = true;

		const initialState = createState( { lastSeenOffsetDays: 400 } );

		const { result } = renderHookWithProvider( () => useResurrectedFreeUserEligibility(), {
			initialState,
			reducers,
		} );

		expect( result.current.hasActivePaidSubscription ).toBe( true );
		expect( result.current.isEligible ).toBe( false );
		expect( result.current.isForcedVariation ).toBe( false );
		expect( mockUseExperiment ).toHaveBeenCalledWith(
			'calypso_resurrected_users_welcome_back_modal_202511',
			expect.objectContaining( { isEligible: false } )
		);
	} );

	it( 'returns experiment data when resurrected and free of active subscriptions', () => {
		selectorsState.purchases = [];
		selectorsState.hasLoaded = true;

		mockUseExperiment.mockReturnValue( [
			false,
			{ variationName: WELCOME_BACK_VARIATIONS.AI_ONLY } as ExperimentAssignment,
		] );

		const initialState = createState( { lastSeenOffsetDays: 400 } );

		const { result } = renderHookWithProvider( () => useResurrectedFreeUserEligibility(), {
			initialState,
			reducers,
		} );

		expect( result.current.isResurrectedSixMonths ).toBe( true );
		expect( result.current.hasActivePaidSubscription ).toBe( false );
		expect( result.current.isEligible ).toBe( true );
		expect( result.current.variationName ).toBe( WELCOME_BACK_VARIATIONS.AI_ONLY );
		expect( result.current.isLoading ).toBe( false );
		expect( result.current.isForcedVariation ).toBe( false );
	} );

	it( 'remains ineligible when the experiment does not return a variation', () => {
		selectorsState.purchases = [];
		selectorsState.hasLoaded = true;
		mockUseExperiment.mockReturnValue( [ false, null ] );

		const initialState = createState( { lastSeenOffsetDays: 400 } );

		const { result } = renderHookWithProvider( () => useResurrectedFreeUserEligibility(), {
			initialState,
			reducers,
		} );

		expect( result.current.variationName ).toBeNull();
		expect( result.current.isEligible ).toBe( false );
		expect( result.current.isForcedVariation ).toBe( false );
	} );

	it( 'forces eligibility when a variation flag is enabled', () => {
		mockIsFeatureEnabled.mockImplementation(
			( flagName ) => flagName === 'welcome-back-modal-ai-only'
		);
		selectorsState.purchases = null;
		selectorsState.hasLoaded = false;

		const initialState = createState( { lastSeenOffsetDays: 30 } );

		const { result } = renderHookWithProvider( () => useResurrectedFreeUserEligibility(), {
			initialState,
			reducers,
		} );

		expect( result.current.isEligible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
		expect( result.current.variationName ).toBe( WELCOME_BACK_VARIATIONS.AI_ONLY );
		expect( result.current.isForcedVariation ).toBe( true );
	} );
} );
