/**
 * @jest-environment jsdom
 */

import { flushOnboardingWelcomeDigest } from '@automattic/api-core';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
	READER_ONBOARDING_DISMISSED_PREFERENCE_KEY,
	READER_ONBOARDING_ELIGIBLE_REGISTRATION_DATE,
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
	// Render each task as a div with data-attributes so tests can introspect
	// `task.disabled` and `task.completed` without needing the real Checklist UI.
	ChecklistItem: ( {
		task,
	}: {
		task: { id: string; title: string; disabled: boolean; completed: boolean };
	} ) => (
		<div
			data-testid={ `checklist-item-${ task.id }` }
			data-disabled={ String( !! task.disabled ) }
			data-completed={ String( !! task.completed ) }
		/>
	),
} ) );

// Render the WP Modal without a portal so headerActions and children
// are reachable via standard screen queries. Expose `onRequestClose` as a
// dedicated "Close modal" button so tests can simulate the X / escape /
// outside-click dismiss path that the real <Modal> wires up.
jest.mock( '@wordpress/components', () => {
	const { Button } =
		jest.requireActual< typeof import('@wordpress/components') >( '@wordpress/components' );
	return {
		Button,
		Modal: ( {
			children,
			headerActions,
			onRequestClose,
		}: {
			children: React.ReactNode;
			headerActions?: React.ReactNode;
			onRequestClose?: () => void;
		} ) => (
			<div role="dialog">
				{ headerActions }
				<button type="button" onClick={ onRequestClose }>
					Close modal
				</button>
				{ children }
			</div>
		),
	};
} );

// ── Interests-step helpers (called by ReaderOnboardingRsm to build the stable
// blog map; mocked here to avoid webp/image imports in the test environment) ──

jest.mock( 'calypso/reader/onboarding-rsm/interests-modal/topic-groups', () => ( {
	getTopicGroups: jest.fn( () => [] ),
} ) );

jest.mock( 'calypso/reader/onboarding-rsm/interests-modal/get-pack-blogs', () => ( {
	getPackBlogs: jest.fn( () => [] ),
} ) );

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
	default: ( {
		onContinue,
		hasFollowed,
		onFollowed,
	}: {
		onContinue: () => void;
		hasFollowed: boolean;
		onFollowed: () => void;
	} ) => (
		<div data-testid="interests-modal-content" data-has-followed={ String( hasFollowed ) }>
			<button onClick={ onContinue }>Continue</button>
			<button onClick={ onFollowed }>Mark followed</button>
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
	savePreference: jest.fn( () => () => Promise.resolve() ),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	// Default to a registration date well before the eligibility cutoff so the
	// registration-date OR clause is OFF by default in tests — count-based
	// cases stay isolated. Individual tests can override per-case.
	getCurrentUserDate: jest.fn().mockReturnValue( '2020-01-01T00:00:00Z' ),
	isCurrentUserEmailVerified: jest.fn().mockReturnValue( true ),
} ) );

const mockRefreshFollowingStreams = jest.fn();
jest.mock( '../use-refresh-following-streams', () => ( {
	useRefreshFollowingStreams: () => mockRefreshFollowingStreams,
} ) );

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	flushOnboardingWelcomeDigest: jest.fn().mockResolvedValue( {
		success: true,
		sent: false,
		blog_count: 0,
	} ),
} ) );

// ── Data hooks ────────────────────────────────────────────────────────────────

jest.mock( 'calypso/reader/data/tags', () => ( {
	useFollowedTags: jest.fn( () => ( { data: [], isPending: false } ) ),
} ) );

jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useSiteSubscriptions: jest.fn( () => ( { subscriptions: [] } ) ),
} ) );

jest.mock( 'calypso/reader/following/hooks/use-non-self-subscriptions-count', () => ( {
	useNonSelfSubscriptionsCount: jest.fn( () => ( {
		isLoading: false,
		nonSelfSubscriptionsCount: 0,
	} ) ),
} ) );

// ── Utilities ─────────────────────────────────────────────────────────────────

jest.mock( '../get-reload-step', () => ( {
	getReloadStep: () => null,
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn();
	const isEnabledMock = jest.fn( () => false );
	return {
		__esModule: true,
		default: Object.assign( config, { isEnabled: isEnabledMock } ),
		isEnabled: isEnabledMock,
	};
} );

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach( () => {
	mockRefreshFollowingStreams.mockClear();
	jest.mocked( flushOnboardingWelcomeDigest ).mockClear();
	jest.mocked( savePreference ).mockClear();
	jest.mocked( recordTracksEvent ).mockClear();
	jest.mocked( isEnabled ).mockReturnValue( false );

	const { getPreference } = jest.requireMock( 'calypso/state/preferences/selectors' ) as {
		getPreference: jest.Mock;
	};
	getPreference.mockReturnValue( null );

	const { useFollowedTags } = jest.requireMock( 'calypso/reader/data/tags' ) as {
		useFollowedTags: jest.Mock;
	};
	const { useSiteSubscriptions: useCachedSiteSubscriptions } = jest.requireMock(
		'calypso/reader/data/site-subscriptions'
	) as {
		useSiteSubscriptions: jest.Mock;
	};
	const { useNonSelfSubscriptionsCount } = jest.requireMock(
		'calypso/reader/following/hooks/use-non-self-subscriptions-count'
	) as {
		useNonSelfSubscriptionsCount: jest.Mock;
	};
	const { getCurrentUserDate } = jest.requireMock( 'calypso/state/current-user/selectors' ) as {
		getCurrentUserDate: jest.Mock;
	};
	useFollowedTags.mockImplementation( () => ( { data: [], isPending: false } ) );
	useCachedSiteSubscriptions.mockReturnValue( { subscriptions: [] } );
	useNonSelfSubscriptionsCount.mockImplementation( () => ( {
		isLoading: false,
		nonSelfSubscriptionsCount: 0,
	} ) );
	getCurrentUserDate.mockReturnValue( '2020-01-01T00:00:00Z' );
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

	it( 'calls refreshFollowingStreams when the interests step is closed via Back', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );

		mockRefreshFollowingStreams.mockClear();

		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( mockRefreshFollowingStreams ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls refreshFollowingStreams when the discover step is closed via Back', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );

		mockRefreshFollowingStreams.mockClear();

		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( mockRefreshFollowingStreams ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'ReaderOnboardingRsm – step close vs navigation analytics', () => {
	// The *_modal_close events should fire only when the user explicitly
	// dismisses a step (X / escape / outside click), not when they navigate
	// forward via Continue/Finish or backward via Back. Each navigation path
	// has its own dedicated continue/back/finish event so the close event no
	// longer doubles up on every transition.

	const closeEventFor = ( step: 'welcome' | 'interests' | 'discover' ) =>
		`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }${ step }_modal_close`;

	it( 'does not record welcome_modal_close when the user clicks Continue from welcome', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }welcome_modal_continue`
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith( closeEventFor( 'welcome' ) );
	} );

	it( 'does not record interests_modal_close when the user clicks Continue from interests', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );

		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_continue`
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith( closeEventFor( 'interests' ) );
	} );

	it( 'does not record interests_modal_close when the user clicks Back from interests', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );

		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_back`
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith( closeEventFor( 'interests' ) );
	} );

	it( 'does not record discover_modal_close when the user clicks Back from discover', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );

		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_back`
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith( closeEventFor( 'discover' ) );
	} );

	it( 'does not record discover_modal_close when the user clicks Finish from discover', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );

		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`,
			expect.any( Object )
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith( closeEventFor( 'discover' ) );
	} );

	it( 'records welcome_modal_close when the user dismisses the welcome step (X / outside click)', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );

		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Close modal' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( closeEventFor( 'welcome' ) );
	} );

	it( 'records interests_modal_close when the user dismisses the interests step (X / outside click)', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );

		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Close modal' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( closeEventFor( 'interests' ) );
	} );

	it( 'records discover_modal_close when the user dismisses the discover step (X / outside click)', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );

		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Close modal' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( closeEventFor( 'discover' ) );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`,
			expect.anything()
		);
	} );
} );

describe( 'ReaderOnboardingRsm – welcome digest flush', () => {
	const navigateToDiscoverStep = async ( user: ReturnType< typeof userEvent.setup > ) => {
		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );
	};

	it( 'calls flushOnboardingWelcomeDigest when the user clicks Finish on the discover step', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await navigateToDiscoverStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( flushOnboardingWelcomeDigest ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not call flushOnboardingWelcomeDigest when the discover step is dismissed', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await navigateToDiscoverStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Close modal' } ) );

		expect( flushOnboardingWelcomeDigest ).not.toHaveBeenCalled();
	} );

	it( 'does not call flushOnboardingWelcomeDigest when the welcome step is dismissed', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Close modal' } ) );

		expect( flushOnboardingWelcomeDigest ).not.toHaveBeenCalled();
	} );

	it( 'does not call flushOnboardingWelcomeDigest when the interests step is dismissed', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Close modal' } ) );

		expect( flushOnboardingWelcomeDigest ).not.toHaveBeenCalled();
	} );

	it( 'does not call flushOnboardingWelcomeDigest when navigating with Continue or Back', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );
		await screen.findByTestId( 'welcome-modal-content' );

		expect( flushOnboardingWelcomeDigest ).not.toHaveBeenCalled();
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
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`,
			expect.objectContaining( {
				followed_tags_count: expect.any( Number ),
				followed_non_self_sites_count: expect.any( Number ),
			} )
		);
	} );

	it( 'does not save completion when the discover step is closed without Finish', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await navigateToSubscribeStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( savePreference ).not.toHaveBeenCalledWith( READER_ONBOARDING_PREFERENCE_KEY, true );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`,
			expect.anything()
		);
	} );

	it( 'records completed with followed_tags_count and followed_non_self_sites_count reflecting the user\u2019s current follows', async () => {
		const { useFollowedTags } = jest.requireMock( 'calypso/reader/data/tags' ) as {
			useFollowedTags: jest.Mock;
		};

		useFollowedTags.mockImplementation( () => ( {
			data: [ { slug: 'tech' }, { slug: 'food' } ],
			isPending: false,
		} ) );
		const { useSiteSubscriptions } = jest.requireMock(
			'calypso/reader/data/site-subscriptions'
		) as {
			useSiteSubscriptions: jest.Mock;
		};
		// Mix of active non-self, stale (unfollowed), and self-owned to verify
		// the filter — only the two active non-self entries should be counted.
		// `nonSelfSubscriptionsCount` defaults to 0 here (per beforeEach), so
		// the reported count comes from the follows query, not the
		// `nonSelfSubscriptionsCount` baseline.
		useSiteSubscriptions.mockReturnValue( {
			subscriptions: [
				{ is_following: true, is_owner: false },
				{ is_following: true, is_owner: false },
				{ is_following: false, is_owner: false },
				{ is_following: true, is_owner: true },
			],
		} );

		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await navigateToSubscribeStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`,
			expect.objectContaining( {
				followed_tags_count: 2,
				followed_non_self_sites_count: 2,
			} )
		);
	} );

	it( 'falls back to nonSelfSubscriptionsCount when the follows query has not hydrated yet', async () => {
		// Guards the `Math.max( nonSelfSubscriptionsCount, queryCount )` merge:
		// if the follows query is empty (e.g. slow network, lazy load)
		// but the non-self subscriptions count hook is already populated, the
		// completion event should report that count rather than 0.
		const { useNonSelfSubscriptionsCount } = jest.requireMock(
			'calypso/reader/following/hooks/use-non-self-subscriptions-count'
		) as { useNonSelfSubscriptionsCount: jest.Mock };
		useNonSelfSubscriptionsCount.mockImplementation( () => ( {
			isLoading: false,
			nonSelfSubscriptionsCount: 5,
		} ) );
		// Follows query intentionally empty — default mock returns [].

		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await navigateToSubscribeStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`,
			expect.objectContaining( { followed_non_self_sites_count: 5 } )
		);
	} );

	it( 'still records completed (without re-saving preference) when the user has already completed onboarding', async () => {
		// Mirrors the forceShow case: a returning user can re-enter the modal
		// and click Finish again — the `completed` event should still fire so
		// we can attribute the funnel, but the preference is already set so we
		// skip the redundant write.
		const { getPreference } = jest.requireMock( 'calypso/state/preferences/selectors' ) as {
			getPreference: jest.Mock;
		};
		getPreference.mockImplementation( ( _state: unknown, key: string ) =>
			key === READER_ONBOARDING_PREFERENCE_KEY ? true : null
		);

		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await navigateToSubscribeStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`,
			expect.any( Object )
		);
		expect( savePreference ).not.toHaveBeenCalledWith( READER_ONBOARDING_PREFERENCE_KEY, true );

		getPreference.mockReturnValue( null );
	} );

	it( 'does not auto-save completion when the user has enough follows without clicking Finish', async () => {
		const { useNonSelfSubscriptionsCount } = jest.requireMock(
			'calypso/reader/following/hooks/use-non-self-subscriptions-count'
		) as { useNonSelfSubscriptionsCount: jest.Mock };
		const { useFollowedTags } = jest.requireMock( 'calypso/reader/data/tags' ) as {
			useFollowedTags: jest.Mock;
		};

		// Rely on forceShow to surface the welcome step so we can assert that completion is not auto-saved
		useNonSelfSubscriptionsCount.mockImplementation( () => ( {
			isLoading: false,
			nonSelfSubscriptionsCount: 0,
		} ) );
		useFollowedTags.mockReturnValue( {
			data: [ { slug: 'a' }, { slug: 'b' }, { slug: 'c' } ],
		} );

		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );

		expect( savePreference ).not.toHaveBeenCalledWith( READER_ONBOARDING_PREFERENCE_KEY, true );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }completed`,
			expect.anything()
		);
	} );
} );

describe( 'ReaderOnboardingRsm – eligibility', () => {
	const makeTags = ( count: number ) =>
		Array.from( { length: count }, ( _, i ) => ( { slug: `tag-${ i }` } ) );

	// One millisecond before the cutoff — exercises the `<` side of the
	// `>= cutoff` comparison and stays bound to the shared constant so we
	// can't drift if it changes.
	const justBeforeCutoff = new Date(
		new Date( READER_ONBOARDING_ELIGIBLE_REGISTRATION_DATE ).getTime() - 1
	).toISOString();

	const overrideMocks = ( {
		nonSelfSubscriptionsCount = 0,
		tags = { data: [] as Array< { slug: string } >, isPending: false },
		subscriptionsLoading = false,
		userRegistrationDate,
	}: {
		nonSelfSubscriptionsCount?: number;
		tags?: { data?: Array< { slug: string } >; isPending?: boolean };
		subscriptionsLoading?: boolean;
		userRegistrationDate?: string | null;
	} = {} ) => {
		const { useFollowedTags } = jest.requireMock( 'calypso/reader/data/tags' ) as {
			useFollowedTags: jest.Mock;
		};
		const { useNonSelfSubscriptionsCount } = jest.requireMock(
			'calypso/reader/following/hooks/use-non-self-subscriptions-count'
		) as { useNonSelfSubscriptionsCount: jest.Mock };
		const { getCurrentUserDate } = jest.requireMock( 'calypso/state/current-user/selectors' ) as {
			getCurrentUserDate: jest.Mock;
		};

		useFollowedTags.mockImplementation( () => ( {
			data: tags.data ?? [],
			isPending: tags.isPending ?? false,
		} ) );
		useNonSelfSubscriptionsCount.mockImplementation( () => ( {
			isLoading: subscriptionsLoading,
			nonSelfSubscriptionsCount,
		} ) );
		if ( userRegistrationDate !== undefined ) {
			getCurrentUserDate.mockReturnValue( userRegistrationDate );
		}

		return { useNonSelfSubscriptionsCount };
	};

	it( 'renders when starting counts are below both thresholds (0 sites / 0 tags)', async () => {
		overrideMocks( { nonSelfSubscriptionsCount: 0, tags: { data: [] } } );

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'renders when sites < 4 even though tags >= 3', async () => {
		overrideMocks( { nonSelfSubscriptionsCount: 3, tags: { data: makeTags( 5 ) } } );

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'renders when tags < 3 even though sites >= 4', async () => {
		overrideMocks( { nonSelfSubscriptionsCount: 5, tags: { data: makeTags( 1 ) } } );

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'does not render when the user starts with >= 4 sites AND >= 3 tags', async () => {
		overrideMocks( { nonSelfSubscriptionsCount: 4, tags: { data: makeTags( 3 ) } } );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render while the followed tags query is still pending', async () => {
		overrideMocks( {
			nonSelfSubscriptionsCount: 4,
			tags: { data: [], isPending: true },
		} );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render while the site subscriptions query is still loading', async () => {
		overrideMocks( { subscriptionsLoading: true } );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the modal open mid-flow even after the user crosses the thresholds', async () => {
		const { useNonSelfSubscriptionsCount } = overrideMocks( {
			nonSelfSubscriptionsCount: 0,
			tags: { data: [] },
		} );

		const { rerender } = renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();

		useNonSelfSubscriptionsCount.mockImplementation( () => ( {
			isLoading: false,
			nonSelfSubscriptionsCount: 10,
		} ) );
		rerender( <ReaderOnboardingRsm /> );

		expect( screen.getByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'renders for users registered on the eligibility cutoff even when above both follow thresholds', async () => {
		overrideMocks( {
			nonSelfSubscriptionsCount: 4,
			tags: { data: makeTags( 3 ) },
			userRegistrationDate: READER_ONBOARDING_ELIGIBLE_REGISTRATION_DATE,
		} );

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'does not render for users registered just before the eligibility cutoff when above both follow thresholds', async () => {
		overrideMocks( {
			nonSelfSubscriptionsCount: 4,
			tags: { data: makeTags( 3 ) },
			userRegistrationDate: justBeforeCutoff,
		} );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render when the registration date is null and follow counts are above both thresholds', async () => {
		overrideMocks( {
			nonSelfSubscriptionsCount: 4,
			tags: { data: makeTags( 3 ) },
			userRegistrationDate: null,
		} );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'ReaderOnboardingRsm - forceShow snapshot', () => {
	const getUseNonSelfSubscriptionsCountMock = () => {
		const { useNonSelfSubscriptionsCount } = jest.requireMock(
			'calypso/reader/following/hooks/use-non-self-subscriptions-count'
		) as { useNonSelfSubscriptionsCount: jest.Mock };
		return useNonSelfSubscriptionsCount;
	};

	const getPreferenceMock = () => {
		const { getPreference } = jest.requireMock( 'calypso/state/preferences/selectors' ) as {
			getPreference: jest.Mock;
		};
		return getPreference;
	};

	// Suppress meetsEligibility entirely so this suite only exercises forceShow.
	// Tag count >= 3 makes the tag side of meetsEligibility false; the site side
	// is controlled per-test via the `useNonSelfSubscriptionsCount` mock's
	// `nonSelfSubscriptionsCount` (always seeded >= 4 here).
	const seedAboveEligibilityThresholds = () => {
		const { useFollowedTags } = jest.requireMock( 'calypso/reader/data/tags' ) as {
			useFollowedTags: jest.Mock;
		};
		useFollowedTags.mockImplementation( () => ( {
			data: [ { slug: 'a' }, { slug: 'b' }, { slug: 'c' } ],
			isPending: false,
		} ) );
	};

	it( 'keeps the checklist visible mid-flow even when nonSelfSubscriptionsCount becomes non-zero', async () => {
		seedAboveEligibilityThresholds();
		const useNonSelfSubscriptionsCount = getUseNonSelfSubscriptionsCountMock();
		useNonSelfSubscriptionsCount.mockImplementation( () => ( {
			isLoading: false,
			nonSelfSubscriptionsCount: 0,
		} ) );

		const { rerender } = renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();

		// Simulate the user subscribing to a site mid-flow.
		useNonSelfSubscriptionsCount.mockImplementation( () => ( {
			isLoading: false,
			nonSelfSubscriptionsCount: 5,
		} ) );
		rerender( <ReaderOnboardingRsm /> );

		expect( screen.getByTestId( 'welcome-modal-content' ) ).toBeVisible();
	} );

	it( 'hides onboarding for the session after the user clicks Finish on the subscribe step', async () => {
		seedAboveEligibilityThresholds();
		const useNonSelfSubscriptionsCount = getUseNonSelfSubscriptionsCountMock();
		useNonSelfSubscriptionsCount.mockImplementation( () => ( {
			isLoading: false,
			nonSelfSubscriptionsCount: 0,
		} ) );

		// Flip the completion preference to true once the user clicks Finish so
		// `meetsEligibility` also remains false after this point without coupling
		// to dispatch timing.
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

		// Modal is closed, and the session hide latch is set — onRender should
		// report false even though the non-self subscription count is still zero.
		await waitFor( () => {
			expect( onRender ).toHaveBeenLastCalledWith( false );
		} );
		expect( screen.queryByTestId( 'subscribe-modal-content' ) ).not.toBeInTheDocument();
	} );

	afterEach( () => {
		getPreferenceMock().mockReturnValue( null );
	} );
} );

describe( 'ReaderOnboardingRsm – interests-step "has followed" state lifted to parent', () => {
	// The interests-step relaxation (Continue allowed once the user has used any
	// subscribe action on that step) must survive remounts of `InterestsModal`.
	// The parent owns the flag and threads it back through the `hasFollowed`
	// prop, and the discover checklist task mirrors the same relaxation.

	it( 'persists hasFollowed across step transitions (interests → discover → back → interests)', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		// Open interests; initial hasFollowed is false (no prior subscribe).
		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		const interestsContent = await screen.findByTestId( 'interests-modal-content' );
		expect( interestsContent ).toHaveAttribute( 'data-has-followed', 'false' );

		// Simulate the user subscribing (individual tag or pack).
		await user.click( screen.getByRole( 'button', { name: 'Mark followed' } ) );
		expect( screen.getByTestId( 'interests-modal-content' ) ).toHaveAttribute(
			'data-has-followed',
			'true'
		);

		// Advance to discover and then Back to interests; the modal remounts.
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await screen.findByTestId( 'subscribe-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );

		// Fresh `InterestsModal` instance, but the parent still reports
		// hasFollowed=true so the relaxed Continue gate carries over.
		expect( await screen.findByTestId( 'interests-modal-content' ) ).toHaveAttribute(
			'data-has-followed',
			'true'
		);
	} );

	it( 'enables the discover task once the user has subscribed in interests, even without enough tags', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );

		// Discover task starts disabled because hasFollowedTags is false and
		// the user hasn't used any interests-step subscribe action yet.
		expect( screen.getByTestId( 'checklist-item-discover-sites' ) ).toHaveAttribute(
			'data-disabled',
			'true'
		);

		// Open interests, simulate any subscribe action, and close.
		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Mark followed' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		// Discover task is now reachable from the checklist even though
		// `useFollowedTags` is still empty (default mock).
		expect( screen.getByTestId( 'checklist-item-discover-sites' ) ).toHaveAttribute(
			'data-disabled',
			'false'
		);
	} );

	it( 'leaves the discover task disabled if the user opens interests without subscribing', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm /> );

		await screen.findByTestId( 'welcome-modal-content' );
		expect( screen.getByTestId( 'checklist-item-discover-sites' ) ).toHaveAttribute(
			'data-disabled',
			'true'
		);

		await user.click( screen.getByRole( 'button', { name: 'Pick your topics' } ) );
		await screen.findByTestId( 'interests-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		// No subscribe action happened; the discover task stays disabled.
		expect( screen.getByTestId( 'checklist-item-discover-sites' ) ).toHaveAttribute(
			'data-disabled',
			'true'
		);
	} );
} );

describe( 'ReaderOnboardingRsm – permanent checklist dismiss', () => {
	const getPreferenceMock = () => {
		const { getPreference } = jest.requireMock( 'calypso/state/preferences/selectors' ) as {
			getPreference: jest.Mock;
		};
		return getPreference;
	};

	const overrideMocks = ( {
		nonSelfSubscriptionsCount = 0,
		tags = { data: [] as Array< { slug: string } >, isPending: false },
		hasDismissedOnboarding = false,
	}: {
		nonSelfSubscriptionsCount?: number;
		tags?: { data?: Array< { slug: string } >; isPending?: boolean };
		hasDismissedOnboarding?: boolean;
	} = {} ) => {
		const { useFollowedTags } = jest.requireMock( 'calypso/reader/data/tags' ) as {
			useFollowedTags: jest.Mock;
		};
		const { useNonSelfSubscriptionsCount } = jest.requireMock(
			'calypso/reader/following/hooks/use-non-self-subscriptions-count'
		) as { useNonSelfSubscriptionsCount: jest.Mock };

		useFollowedTags.mockImplementation( () => ( {
			data: tags.data ?? [],
			isPending: tags.isPending ?? false,
		} ) );
		useNonSelfSubscriptionsCount.mockImplementation( () => ( {
			isLoading: false,
			nonSelfSubscriptionsCount,
		} ) );
		getPreferenceMock().mockImplementation( ( _state: unknown, key: string ) => {
			if ( key === READER_ONBOARDING_DISMISSED_PREFERENCE_KEY ) {
				return hasDismissedOnboarding;
			}
			return null;
		} );
	};

	it( 'renders the dismiss button when onboarding is visible', async () => {
		overrideMocks();

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect(
			await screen.findByRole( 'button', { name: 'Dismiss onboarding checklist' } )
		).toBeVisible();
	} );

	it( 'opens the confirm modal and records dismiss_click when the dismiss button is clicked', async () => {
		overrideMocks();
		const user = userEvent.setup();

		renderWithProvider( <ReaderOnboardingRsm /> );

		await user.click(
			await screen.findByRole( 'button', { name: 'Dismiss onboarding checklist' } )
		);

		expect(
			screen.getByText(
				'You will not be able to access the Reader onboarding flow again. Are you sure you want to dismiss it?'
			)
		).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }checklist_dismiss_click`
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }checklist_dismiss_confirm`
		);
	} );

	it( 'closes the confirm modal on cancel without saving and records dismiss_cancel', async () => {
		overrideMocks();
		const user = userEvent.setup();

		renderWithProvider( <ReaderOnboardingRsm /> );

		await user.click(
			await screen.findByRole( 'button', { name: 'Dismiss onboarding checklist' } )
		);
		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect(
			screen.queryByText(
				'You will not be able to access the Reader onboarding flow again. Are you sure you want to dismiss it?'
			)
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Dismiss onboarding checklist' } ) ).toBeVisible();
		expect( savePreference ).not.toHaveBeenCalledWith(
			READER_ONBOARDING_DISMISSED_PREFERENCE_KEY,
			true
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }checklist_dismiss_cancel`
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }checklist_dismiss_confirm`
		);
	} );

	it( 'permanently dismisses onboarding on confirm, closes open step modals, and records dismiss_confirm', async () => {
		overrideMocks();
		const getPreference = getPreferenceMock();
		jest.mocked( savePreference ).mockImplementation( ( key, value ) => {
			if ( key === READER_ONBOARDING_DISMISSED_PREFERENCE_KEY ) {
				getPreference.mockImplementation( ( _state: unknown, prefKey: string ) =>
					prefKey === READER_ONBOARDING_DISMISSED_PREFERENCE_KEY ? value : null
				);
			}
			return () => Promise.resolve();
		} );

		const onRender = jest.fn();
		const user = userEvent.setup();
		const { rerender } = renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss onboarding checklist' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( savePreference ).toHaveBeenCalledWith(
			READER_ONBOARDING_DISMISSED_PREFERENCE_KEY,
			true
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }checklist_dismiss_confirm`
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }welcome_modal_close`
		);
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();

		rerender( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenLastCalledWith( false );
		} );
		expect(
			screen.queryByRole( 'button', { name: 'Dismiss onboarding checklist' } )
		).not.toBeInTheDocument();
	} );

	it( 'does not render onboarding when the dismissed preference is set, even if otherwise eligible', async () => {
		overrideMocks( { hasDismissedOnboarding: true } );
		const onRender = jest.fn();

		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await waitFor( () => {
			expect( onRender ).toHaveBeenCalled();
		} );
		expect( onRender ).toHaveBeenLastCalledWith( false );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Dismiss onboarding checklist' } )
		).not.toBeInTheDocument();
	} );

	it( 'still renders onboarding when reader/force-onboarding is enabled even if permanently dismissed', async () => {
		overrideMocks( { hasDismissedOnboarding: true } );
		jest
			.mocked( isEnabled )
			.mockImplementation( ( flag: string ) => flag === 'reader/force-onboarding' );

		renderWithProvider( <ReaderOnboardingRsm /> );

		expect( await screen.findByTestId( 'welcome-modal-content' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Dismiss onboarding checklist' } ) ).toBeVisible();
	} );

	it( 'hides onboarding for the session when dismissed under reader/force-onboarding', async () => {
		overrideMocks( { hasDismissedOnboarding: true } );
		jest
			.mocked( isEnabled )
			.mockImplementation( ( flag: string ) => flag === 'reader/force-onboarding' );

		const onRender = jest.fn();
		const user = userEvent.setup();
		renderWithProvider( <ReaderOnboardingRsm onRender={ onRender } /> );

		await screen.findByTestId( 'welcome-modal-content' );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss onboarding checklist' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		await waitFor( () => {
			expect( onRender ).toHaveBeenLastCalledWith( false );
		} );
		expect( screen.queryByTestId( 'welcome-modal-content' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Dismiss onboarding checklist' } )
		).not.toBeInTheDocument();
	} );
} );
