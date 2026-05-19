/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
	READER_ONBOARDING_PREFERENCE_KEY,
	READER_ONBOARDING_TRACKS_EVENT_PREFIX,
} from 'calypso/reader/onboarding-rsm/constants';
import { savePreference } from 'calypso/state/preferences/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderOnboardingRsm from '../index';

// ── Router ────────────────────────────────────────────────────────────────────

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { redirect: jest.fn() } ),
} ) );

// ── Heavy UI ──────────────────────────────────────────────────────────────────

jest.mock( '@automattic/components', () => ( {
	CircularProgressBar: () => null,
} ) );

jest.mock( '@automattic/launchpad', () => ( {
	Checklist: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
	ChecklistItem: () => null,
} ) );

// Render the WP Modal without a portal so headerActions and children
// are reachable via standard screen queries.
jest.mock( '@wordpress/components', () => {
	const { Button } =
		jest.requireActual< typeof import('@wordpress/components') >( '@wordpress/components' );
	return {
		Button,
		Modal: ( {
			children,
			headerActions,
		}: {
			children: React.ReactNode;
			headerActions?: React.ReactNode;
		} ) => (
			<div role="dialog">
				{ headerActions }
				{ children }
			</div>
		),
	};
} );

// ── Child modals (not under test here) ───────────────────────────────────────

jest.mock( 'calypso/reader/onboarding-rsm/welcome-modal', () => ( {
	__esModule: true,
	default: ( { onContinue }: { onContinue: () => void } ) => (
		<div data-testid="welcome-modal-content">
			<button onClick={ onContinue }>Pick your topics</button>
		</div>
	),
} ) );

jest.mock( 'calypso/reader/onboarding-rsm/interests-modal', () => ( {
	__esModule: true,
	default: ( { onContinue }: { onContinue: () => void } ) => (
		<div data-testid="interests-modal-content">
			<button onClick={ onContinue }>Continue</button>
		</div>
	),
} ) );

jest.mock( 'calypso/reader/onboarding-rsm/subscribe-modal', () => ( {
	__esModule: true,
	default: ( { onFinish }: { onFinish: () => void } ) => (
		<div data-testid="subscribe-modal-content">
			<button onClick={ onFinish }>Finish</button>
		</div>
	),
} ) );

// ── Redux / selectors ─────────────────────────────────────────────────────────

jest.mock( 'calypso/state/preferences/selectors', () => ( {
	// null = onboarding neither completed nor seen; triggers auto-open of welcome step.
	getPreference: jest.fn().mockReturnValue( null ),
	hasReceivedRemotePreferences: jest.fn().mockReturnValue( true ),
} ) );

jest.mock( 'calypso/state/preferences/actions', () => ( {
	savePreference: jest.fn( () => ( { type: 'PREFERENCES_SAVE' } ) ),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isCurrentUserEmailVerified: jest.fn().mockReturnValue( true ),
} ) );

jest.mock( 'calypso/state/reader/follows/selectors', () => ( {
	getReaderFollows: jest.fn().mockReturnValue( [] ),
	getReaderFollowsLastSyncTime: jest.fn().mockReturnValue( 1 ),
} ) );

jest.mock( 'calypso/state/reader/follows/actions', () => ( {
	requestFollows: jest.fn( () => ( { type: 'READER_FOLLOWS_REQUEST' } ) ),
} ) );

jest.mock( 'calypso/state/reader/streams/actions', () => ( {
	clearStream: jest.fn( () => ( { type: 'READER_CLEAR_STREAM' } ) ),
	requestPage: jest.fn( () => ( { type: 'READER_REQUEST_PAGE' } ) ),
	requestPaginatedStream: jest.fn( () => ( { type: 'READER_REQUEST_PAGINATED_STREAM' } ) ),
} ) );

const mockRefreshFollowingStreams = jest.fn();
jest.mock( '../use-refresh-following-streams', () => ( {
	useRefreshFollowingStreams: () => mockRefreshFollowingStreams,
} ) );

// ── Data hooks ────────────────────────────────────────────────────────────────

jest.mock( 'calypso/data/reader/use-reader-tags', () => ( {
	useFollowedReaderTags: jest.fn( () => ( { data: [], isPending: false } ) ),
} ) );

jest.mock( '../../following/use-site-subscriptions', () => ( {
	useSiteSubscriptions: jest.fn( () => ( { isLoading: false, hasNonSelfSubscriptions: false } ) ),
} ) );

// ── Utilities ─────────────────────────────────────────────────────────────────

jest.mock( '../get-reload-step', () => ( {
	getReloadStep: () => null,
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach( () => {
	mockRefreshFollowingStreams.mockClear();
	jest.mocked( savePreference ).mockClear();
	jest.mocked( recordTracksEvent ).mockClear();

	const { getReaderFollows, getReaderFollowsLastSyncTime } = jest.requireMock(
		'calypso/state/reader/follows/selectors'
	) as { getReaderFollows: jest.Mock; getReaderFollowsLastSyncTime: jest.Mock };
	const { useFollowedReaderTags } = jest.requireMock( 'calypso/data/reader/use-reader-tags' ) as {
		useFollowedReaderTags: jest.Mock;
	};
	const { useSiteSubscriptions } = jest.requireMock( '../../following/use-site-subscriptions' ) as {
		useSiteSubscriptions: jest.Mock;
	};
	getReaderFollows.mockReturnValue( [] );
	getReaderFollowsLastSyncTime.mockReturnValue( 1 );
	useFollowedReaderTags.mockImplementation( () => ( { data: [], isPending: false } ) );
	useSiteSubscriptions.mockImplementation( () => ( {
		isLoading: false,
		hasNonSelfSubscriptions: false,
	} ) );
} );

describe( 'ReaderOnboardingRsm – back button navigation', () => {
	// The welcome step auto-opens because hasSeenOnboarding is null (mocked via getPreference).

	it( 'does not show a back button on the welcome step', async () => {
		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows a back button on the interests step that navigates back to the welcome step', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );

		expect( await screen.findByTestId( 'interests-modal-content' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Back' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows a back button on the subscribe step that navigates back to the interests step', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( await screen.findByTestId( 'subscribe-modal-content' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Back' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( await screen.findByTestId( 'interests-modal-content' ) ).toBeVisible();
	} );
} );

describe( 'ReaderOnboardingRsm – stream refresh on step close', () => {
	it( 'calls refreshFollowingStreams when the interests step is closed via Continue', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );

		expect( mockRefreshFollowingStreams ).not.toHaveBeenCalled();

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( mockRefreshFollowingStreams ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls refreshFollowingStreams when the discover step is closed via Finish', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );

		mockRefreshFollowingStreams.mockClear();

		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( mockRefreshFollowingStreams ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not call refreshFollowingStreams when only the welcome step is closed', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );

		// welcome close side-effects fire on Continue; refresh should NOT be called
		expect( mockRefreshFollowingStreams ).not.toHaveBeenCalled();
	} );
} );

describe( 'ReaderOnboardingRsm – onboarding completion', () => {
	const navigateToSubscribeStep = async ( user: ReturnType< typeof userEvent.setup > ) => {
		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );
	};

	it( 'saves the completion preference and records completed when Finish is clicked', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await navigateToSubscribeStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( savePreference ).toHaveBeenCalledWith( READER_ONBOARDING_PREFERENCE_KEY, true );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`
		);
	} );

	it( 'does not save completion when the discover step is closed without Finish', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await navigateToSubscribeStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( savePreference ).not.toHaveBeenCalledWith( READER_ONBOARDING_PREFERENCE_KEY, true );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`
		);
	} );

	it( 'does not auto-save completion when the user has enough follows without clicking Finish', async () => {
		const { getReaderFollows } = jest.requireMock( 'calypso/state/reader/follows/selectors' ) as {
			getReaderFollows: jest.Mock;
		};
		const { useFollowedReaderTags } = jest.requireMock( 'calypso/data/reader/use-reader-tags' ) as {
			useFollowedReaderTags: jest.Mock;
		};

		getReaderFollows.mockReturnValue(
			Array.from( { length: 4 }, ( _, i ) => ( { feed_ID: i + 1, is_owner: false } ) )
		);
		useFollowedReaderTags.mockReturnValue( {
			data: [ { slug: 'a' }, { slug: 'b' }, { slug: 'c' } ],
		} );

		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );

		expect( savePreference ).not.toHaveBeenCalledWith( READER_ONBOARDING_PREFERENCE_KEY, true );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`
		);

		getReaderFollows.mockReturnValue( [] );
		useFollowedReaderTags.mockImplementation( () => ( { data: [] } ) );
	} );
} );

describe( 'ReaderOnboardingRsm – eligibility', () => {
	const makeFollows = ( count: number ) =>
		Array.from( { length: count }, ( _, i ) => ( { feed_ID: i + 1, is_owner: false } ) );

	const makeTags = ( count: number ) =>
		Array.from( { length: count }, ( _, i ) => ( { slug: `tag-${ i }` } ) );

	const overrideMocks = ( {
		follows = [],
		tags = { data: [] as Array< { slug: string } >, isPending: false },
		lastSyncTime = 1 as number | null,
		hasNonSelfSubscriptions = true,
	}: {
		follows?: Array< { feed_ID: number; is_owner: boolean } >;
		tags?: { data?: Array< { slug: string } >; isPending?: boolean };
		lastSyncTime?: number | null;
		hasNonSelfSubscriptions?: boolean;
	} = {} ) => {
		const { getReaderFollows, getReaderFollowsLastSyncTime } = jest.requireMock(
			'calypso/state/reader/follows/selectors'
		) as { getReaderFollows: jest.Mock; getReaderFollowsLastSyncTime: jest.Mock };
		const { useFollowedReaderTags } = jest.requireMock( 'calypso/data/reader/use-reader-tags' ) as {
			useFollowedReaderTags: jest.Mock;
		};
		const { useSiteSubscriptions } = jest.requireMock(
			'../../following/use-site-subscriptions'
		) as { useSiteSubscriptions: jest.Mock };

		getReaderFollows.mockReturnValue( follows );
		getReaderFollowsLastSyncTime.mockReturnValue( lastSyncTime );
		useFollowedReaderTags.mockImplementation( () => ( {
			data: tags.data ?? [],
			isPending: tags.isPending ?? false,
		} ) );
		useSiteSubscriptions.mockImplementation( () => ( {
			isLoading: false,
			hasNonSelfSubscriptions,
		} ) );

		return { getReaderFollows };
	};

	it( 'renders when starting counts are below both thresholds (0 sites / 0 tags)', async () => {
		overrideMocks( { follows: [], tags: { data: [] } } );

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'renders when sites < 4 even though tags >= 3', async () => {
		overrideMocks( { follows: makeFollows( 2 ), tags: { data: makeTags( 5 ) } } );

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'renders when tags < 3 even though sites >= 4', async () => {
		overrideMocks( { follows: makeFollows( 5 ), tags: { data: makeTags( 1 ) } } );

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'does not render when the user starts with >= 4 sites AND >= 3 tags', async () => {
		overrideMocks( { follows: makeFollows( 4 ), tags: { data: makeTags( 3 ) } } );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render while the followed tags query is still pending', async () => {
		overrideMocks( { tags: { data: [], isPending: true } } );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render while the reader follows have not synced yet', async () => {
		overrideMocks( { lastSyncTime: null } );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the modal open mid-flow even after the user crosses the thresholds', async () => {
		const { getReaderFollows } = overrideMocks( {
			follows: [],
			tags: { data: [] },
		} );

		const { rerender } = renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();

		getReaderFollows.mockReturnValue( makeFollows( 10 ) );
		rerender( <ReaderOnboardingRsm /> );

		expect( screen.getByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );
} );

describe( 'ReaderOnboardingRsm – forceShow snapshot', () => {
	const getUseSiteSubscriptionsMock = () => {
		const { useSiteSubscriptions } = jest.requireMock(
			'../../following/use-site-subscriptions'
		) as { useSiteSubscriptions: jest.Mock };
		return useSiteSubscriptions;
	};

	const getPreferenceMock = () => {
		const { getPreference } = jest.requireMock( 'calypso/state/preferences/selectors' ) as {
			getPreference: jest.Mock;
		};
		return getPreference;
	};

	// Suppress meetsEligibility entirely so this suite only exercises forceShow.
	// Use 4 non-self follows + 3 tags so the snapshot makes meetsEligibility=false.
	const seedAboveEligibilityThresholds = () => {
		const { getReaderFollows } = jest.requireMock( 'calypso/state/reader/follows/selectors' ) as {
			getReaderFollows: jest.Mock;
		};
		const { useFollowedReaderTags } = jest.requireMock( 'calypso/data/reader/use-reader-tags' ) as {
			useFollowedReaderTags: jest.Mock;
		};
		getReaderFollows.mockReturnValue(
			Array.from( { length: 4 }, ( _, i ) => ( { feed_ID: i + 1, is_owner: false } ) )
		);
		useFollowedReaderTags.mockImplementation( () => ( {
			data: [ { slug: 'a' }, { slug: 'b' }, { slug: 'c' } ],
			isPending: false,
		} ) );
	};

	it( 'keeps the checklist visible mid-flow even when hasNonSelfSubscriptions flips to true', async () => {
		seedAboveEligibilityThresholds();
		const useSiteSubscriptions = getUseSiteSubscriptionsMock();
		useSiteSubscriptions.mockImplementation( () => ( {
			isLoading: false,
			hasNonSelfSubscriptions: false,
		} ) );

		const { rerender } = renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();

		// Simulate the user subscribing to a site mid-flow.
		useSiteSubscriptions.mockImplementation( () => ( {
			isLoading: false,
			hasNonSelfSubscriptions: true,
		} ) );
		rerender( <ReaderOnboardingRsm /> );

		expect( screen.getByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'disables forceShow after the user clicks Finish on the subscribe step', async () => {
		seedAboveEligibilityThresholds();
		const useSiteSubscriptions = getUseSiteSubscriptionsMock();
		useSiteSubscriptions.mockImplementation( () => ( {
			isLoading: false,
			hasNonSelfSubscriptions: false,
		} ) );

		// Flip the completion preference to true once the user clicks Finish so
		// `meetsEligibility` also remains false after this point — mirrors the
		// real Redux roundtrip without coupling to dispatch timing.
		const getPreference = getPreferenceMock();
		getPreference.mockImplementation( ( _state: unknown, key: string ) =>
			key === READER_ONBOARDING_PREFERENCE_KEY ? false : null
		);

		const onRender = jest.fn();
		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		// Drive the user through to Finish.
		await screen.findByTestId( 'welcome-modal-content' );
		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );

		getPreference.mockImplementation( ( _state: unknown, key: string ) =>
			key === READER_ONBOARDING_PREFERENCE_KEY ? true : null
		);

		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		// Modal is closed, and forceShow is now off — onRender should report false
		// even though hasNonSelfSubscriptions is still false.
		await waitFor( () => {
			expect( onRender ).toHaveBeenLastCalledWith( false );
		} );
		expect( screen.queryByTestId( 'subscribe-modal-content' ) ).not.toBeInTheDocument();
	} );

	afterEach( () => {
		getPreferenceMock().mockReturnValue( null );
	} );
} );
