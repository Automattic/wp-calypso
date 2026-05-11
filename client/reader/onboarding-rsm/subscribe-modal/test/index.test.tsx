/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SubscribeModal from '../index';

// ── Recommendations hook ─────────────────────────────────────────────────────

jest.mock( '../use-subscribe-recommendations', () => ( {
	useSubscribeRecommendations: () => ( {
		combinedRecommendations: [],
		recommendations: [],
		isLoading: false,
		isValidating: false,
		hasNoRecommendations: false,
		followedTagSlugs: [],
		markSessionFollow: jest.fn(),
	} ),
} ) );

// ── Heavy UI dependencies ────────────────────────────────────────────────────

jest.mock( 'calypso/reader/stream', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/blocks/reader-subscription-list-item/connected', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: () => null,
} ) );

jest.mock( 'calypso/components/data/query-reader-site', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/reader/follow-button', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/reader/controller-helper', () => ( {
	trackScrollPage: jest.fn(),
} ) );

jest.mock( '@automattic/components', () => ( {
	LoadingPlaceholder: () => null,
} ) );

// ── Give the nudge a stable test-id so tests can assert on its presence ──────

jest.mock( '../verificationNudge', () => ( {
	__esModule: true,
	default: () => <div data-testid="subscribe-verification-nudge" />,
} ) );

// ── Redux / state ────────────────────────────────────────────────────────────

jest.mock( 'calypso/state/reader/feeds/selectors', () => ( {
	getFeed: jest.fn().mockReturnValue( null ),
} ) );

jest.mock( 'calypso/state/reader/streams/actions', () => ( {
	requestPage: jest.fn( () => ( { type: 'READER_REQUEST_PAGE' } ) ),
	requestPaginatedStream: jest.fn( () => ( { type: 'READER_REQUEST_PAGINATED_STREAM' } ) ),
} ) );

// ── Analytics ────────────────────────────────────────────────────────────────

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// ── Shared step indicator (not under test here) ──────────────────────────────

jest.mock( 'calypso/reader/onboarding-rsm/step-indicator', () => ( {
	StepIndicator: () => null,
} ) );

// ── Tests ────────────────────────────────────────────────────────────────────

describe( 'SubscribeModal – verification nudge', () => {
	it( 'does not render the verification nudge when promptVerification is false', () => {
		renderWithProvider( <SubscribeModal onClose={ jest.fn() } promptVerification={ false } /> );

		expect( screen.queryByTestId( 'subscribe-verification-nudge' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the verification nudge when promptVerification is true', () => {
		renderWithProvider( <SubscribeModal onClose={ jest.fn() } promptVerification /> );

		expect( screen.getByTestId( 'subscribe-verification-nudge' ) ).toBeVisible();
	} );

	it( 'disables the Finish button when promptVerification is true', () => {
		renderWithProvider( <SubscribeModal onClose={ jest.fn() } promptVerification /> );

		// accessibleWhenDisabled renders aria-disabled instead of the native disabled attribute.
		expect( screen.getByRole( 'button', { name: 'Finish' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'does not invoke onClose when Finish is clicked while verification is required', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();

		renderWithProvider( <SubscribeModal onClose={ onClose } promptVerification /> );

		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( onClose ).not.toHaveBeenCalled();
	} );

	it( 'enables the Finish button when promptVerification is false', () => {
		renderWithProvider( <SubscribeModal onClose={ jest.fn() } promptVerification={ false } /> );

		const button = screen.getByRole( 'button', { name: 'Finish' } );
		expect( button ).not.toHaveAttribute( 'aria-disabled', 'true' );
		expect( button ).not.toBeDisabled();
	} );
} );
