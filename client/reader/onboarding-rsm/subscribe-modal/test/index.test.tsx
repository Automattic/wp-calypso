/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { prefetchInfiniteStream } from 'calypso/reader/data/stream';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SubscribeModal from '../index';
import type { CardData } from '../use-subscribe-recommendations';

// ── Recommendations hook ─────────────────────────────────────────────────────

// Explicit array element types so per-test overrides that supply `CardData[]`
// (or `string[]` for `followedTagSlugs`) don't get inferred as `never[]` from
// the empty defaults — keeps TypeScript happy without an `as` cast.
const defaultRecommendationsHookValue = {
	combinedRecommendations: [] as CardData[],
	recommendations: [] as CardData[],
	isLoading: false,
	isValidating: false,
	hasNoRecommendations: false,
	followedTagSlugs: [] as string[],
	markSessionFollow: jest.fn(),
};

const mockedRecommendationsHook = jest.fn( () => defaultRecommendationsHookValue );

jest.mock( '../use-subscribe-recommendations', () => ( {
	useSubscribeRecommendations: () => mockedRecommendationsHook(),
} ) );

// ── Heavy UI dependencies ────────────────────────────────────────────────────

jest.mock( 'calypso/reader/stream', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/reader/data/stream', () => ( {
	prefetchInfiniteStream: jest.fn( () => Promise.resolve() ),
} ) );

// Render the list item as a button so tests can click it and exercise the
// `onItemClick` callback (which is what fires the site-previewed event).
jest.mock( 'calypso/blocks/reader-subscription-list-item/connected', () => ( {
	__esModule: true,
	default: ( {
		feedId,
		site,
		onItemClick,
	}: {
		feedId: number;
		site: { site_name: string };
		onItemClick: () => void;
	} ) => (
		<button type="button" data-testid={ `reader-list-item-${ feedId }` } onClick={ onItemClick }>
			{ site.site_name }
		</button>
	),
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
		renderWithProvider( <SubscribeModal onFinish={ jest.fn() } promptVerification={ false } /> );

		expect( screen.queryByTestId( 'subscribe-verification-nudge' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the verification nudge when promptVerification is true', () => {
		renderWithProvider( <SubscribeModal onFinish={ jest.fn() } promptVerification /> );

		expect( screen.getByTestId( 'subscribe-verification-nudge' ) ).toBeVisible();
	} );

	it( 'disables the Finish button when promptVerification is true', () => {
		renderWithProvider( <SubscribeModal onFinish={ jest.fn() } promptVerification /> );

		// accessibleWhenDisabled renders aria-disabled instead of the native disabled attribute.
		expect( screen.getByRole( 'button', { name: 'Finish' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'does not invoke onFinish when Finish is clicked while verification is required', async () => {
		const user = userEvent.setup();
		const onFinish = jest.fn();

		renderWithProvider( <SubscribeModal onFinish={ onFinish } promptVerification /> );

		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( onFinish ).not.toHaveBeenCalled();
	} );

	it( 'invokes onFinish when Finish is clicked and verification is not required', async () => {
		const user = userEvent.setup();
		const onFinish = jest.fn();

		renderWithProvider( <SubscribeModal onFinish={ onFinish } promptVerification={ false } /> );

		await user.click( screen.getByRole( 'button', { name: 'Finish' } ) );

		expect( onFinish ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'enables the Finish button when promptVerification is false', () => {
		renderWithProvider( <SubscribeModal onFinish={ jest.fn() } promptVerification={ false } /> );

		const button = screen.getByRole( 'button', { name: 'Finish' } );
		expect( button ).not.toHaveAttribute( 'aria-disabled', 'true' );
		expect( button ).not.toBeDisabled();
	} );
} );

describe( 'SubscribeModal – site preview analytics', () => {
	const makeRecommendation = ( i: number ) => ( {
		feed_ID: 100 + i,
		site_ID: 200 + i,
		site_URL: `https://site-${ i }.example`,
		site_name: `Site ${ i }`,
		feed_URL: `https://site-${ i }.example/feed`,
		has_icon: true,
	} );

	beforeEach( () => {
		jest.mocked( recordTracksEvent ).mockClear();
		jest.mocked( prefetchInfiniteStream ).mockClear();
		mockedRecommendationsHook.mockReturnValue( defaultRecommendationsHookValue );
	} );

	it( 'records discover_modal_site_previewed when the user picks a different site in the list', async () => {
		const user = userEvent.setup();
		const recommendations = [ makeRecommendation( 0 ), makeRecommendation( 1 ) ];
		mockedRecommendationsHook.mockReturnValue( {
			...defaultRecommendationsHookValue,
			combinedRecommendations: recommendations,
			recommendations,
		} );

		renderWithProvider( <SubscribeModal onFinish={ jest.fn() } promptVerification={ false } /> );

		// First recommendation is auto-selected on mount, so clicking it again is
		// a no-op and must NOT fire the previewed event. Clicking a *different*
		// site is what should fire it.
		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByTestId( 'reader-list-item-101' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_onboarding_discover_modal_site_previewed',
			expect.objectContaining( {
				feed_id: 101,
				site_id: 201,
				site_name: 'Site 1',
			} )
		);
	} );

	it( 'does not record discover_modal_site_previewed when the same site is clicked again', async () => {
		const user = userEvent.setup();
		const recommendations = [ makeRecommendation( 0 ) ];
		mockedRecommendationsHook.mockReturnValue( {
			...defaultRecommendationsHookValue,
			combinedRecommendations: recommendations,
			recommendations,
		} );

		renderWithProvider( <SubscribeModal onFinish={ jest.fn() } promptVerification={ false } /> );

		// First (and only) recommendation is auto-selected; clicking it should not
		// fire a duplicate previewed event.
		jest.mocked( recordTracksEvent ).mockClear();
		await user.click( screen.getByTestId( 'reader-list-item-100' ) );

		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_reader_onboarding_discover_modal_site_previewed',
			expect.anything()
		);
	} );

	it( 'prefetches recommendation streams through the React Query stream cache', () => {
		const recommendations = [ makeRecommendation( 0 ), makeRecommendation( 1 ) ];
		mockedRecommendationsHook.mockReturnValue( {
			...defaultRecommendationsHookValue,
			combinedRecommendations: recommendations,
			recommendations,
		} );

		renderWithProvider( <SubscribeModal onFinish={ jest.fn() } promptVerification={ false } /> );

		expect( prefetchInfiniteStream ).toHaveBeenCalledWith( expect.anything(), expect.anything(), {
			streamKey: 'feed:100',
		} );
		expect( prefetchInfiniteStream ).toHaveBeenCalledWith( expect.anything(), expect.anything(), {
			streamKey: 'feed:101',
		} );
	} );
} );
