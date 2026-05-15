/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
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
	default: ( { onClose }: { onClose: () => void } ) => (
		<div data-testid="subscribe-modal-content">
			<button onClick={ onClose }>Finish</button>
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
	getCurrentUserDate: jest.fn().mockReturnValue( '2025-06-01' ),
	isCurrentUserEmailVerified: jest.fn().mockReturnValue( true ),
} ) );

jest.mock( 'calypso/state/reader/follows/selectors', () => ( {
	getReaderFollows: jest.fn().mockReturnValue( [] ),
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
	useFollowedReaderTags: () => ( { data: [] } ),
} ) );

jest.mock( '../../following/use-site-subscriptions', () => ( {
	useSiteSubscriptions: () => ( { isLoading: false, hasNonSelfSubscriptions: false } ),
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
