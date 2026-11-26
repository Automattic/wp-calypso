/**
 * @vitest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { vi } from 'vitest';
import { READER_ONBOARDING_FOLLOW_SOURCE } from 'calypso/reader/onboarding-rsm/constants';
import { recordFollow } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import InterestsModal from '../index';
import { getTopicGroups } from '../topic-groups';

const mockFollowMutate = vi.fn();

// The parent owns `hasFollowed` and `relaxedPackCriteria` so they persist
// across remounts of this modal. Most tests don't care about those flags and
// rely on the default props. Tests that need the flags to flip in response to
// user actions mount this wrapper, which mirrors what the parent does.
type InterestsModalProps = React.ComponentProps< typeof InterestsModal >;
const InterestsModalWithFollowedState = (
	props: Omit<
		InterestsModalProps,
		'hasFollowed' | 'onFollowed' | 'relaxedPackCriteria' | 'onPackSubscribed'
	>
) => {
	const [ hasFollowed, setHasFollowed ] = useState( false );
	const [ relaxedPackCriteria, setRelaxedPackCriteria ] = useState< Set< string > >(
		() => new Set()
	);
	return (
		<InterestsModal
			{ ...props }
			hasFollowed={ hasFollowed }
			onFollowed={ () => setHasFollowed( true ) }
			relaxedPackCriteria={ relaxedPackCriteria }
			onPackSubscribed={ ( packId: string ) =>
				setRelaxedPackCriteria( ( current ) => new Set( current ).add( packId ) )
			}
		/>
	);
};

// ── External data hooks ──────────────────────────────────────────────────────

vi.mock( 'calypso/data/reader/use-reader-interest-tags', () => ( {
	useReaderInterestTags: () => [],
} ) );

vi.mock( 'calypso/reader/data/tags', () => ( {
	useFollowedTags: () => ( { data: [] } ),
} ) );

// ── Internal helpers / child components ─────────────────────────────────────

vi.mock( '../topic-groups', () => ( {
	getTopicGroups: vi.fn( () => [] ),
} ) );

vi.mock( '../topic-group-card', async () => {
	const React = await vi.importActual< typeof import( 'react' ) >( 'react' );
	return {
		__esModule: true,
		default: ( {
			title,
			blogs,
			onSubscribe,
		}: {
			title: string;
			blogs: { length: number }[];
			onSubscribe: () => void;
		} ) =>
			React.createElement(
				'button',
				{
					type: 'button',
					'data-testid': 'topic-pack-card',
					'data-title': title,
					'data-blog-count': String( blogs.length ),
					onClick: onSubscribe,
				},
				'Pack subscribe'
			),
	};
} );

// Give the nudge a stable test-id so tests can assert on its presence.
vi.mock( '../verificationNudge', () => ( {
	__esModule: true,
	default: () => <div data-testid="interests-verification-nudge" />,
} ) );

// ── State hooks ──────────────────────────────────────────────────────────────

vi.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	getFollowingSource: vi.fn( () => 'test-source' ),
	useFollowSite: vi.fn( () => ( {
		mutate: mockFollowMutate,
		mutateAsync: mockFollowMutate,
		isPending: false,
	} ) ),
	useUnfollowSite: vi.fn(),
	useIsSubscribed: vi.fn( () => false ),
	useSiteSubscriptions: vi.fn( () => ( { subscriptions: [], refetch: vi.fn() } ) ),
} ) );

vi.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: vi.fn( () => ( { type: 'NOTICES_ERROR' } ) ),
} ) );

// ── Analytics / i18n ────────────────────────────────────────────────────────

vi.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

// Mock as a thunk action creator so `dispatch( recordReaderTracksEvent(...) )`
// still works inside `renderWithProvider`, while letting tests assert on the
// call arguments.
vi.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: vi.fn(
		( name: string, properties: Record< string, unknown > ) => () => ( {
			type: 'READER_RECORD_TRACKS_EVENT',
			name,
			properties,
		} )
	),
} ) );

vi.mock( 'calypso/reader/stats', () => ( {
	recordFollow: vi.fn(),
} ) );

vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual< typeof import( 'i18n-calypso' ) >( 'i18n-calypso' ) ),
	fixMe: ( { newCopy }: { newCopy: string } ) => newCopy,
} ) );

// ── TanStack / mutations ─────────────────────────────────────────────────────

vi.mock( '@tanstack/react-query', async () => ( {
	...( await vi.importActual< typeof import( '@tanstack/react-query' ) >(
		'@tanstack/react-query'
	) ),
	useMutation: () => ( { mutateAsync: vi.fn().mockResolvedValue( undefined ) } ),
} ) );

vi.mock( '@automattic/api-queries', () => ( {
	followReadTagMutation: vi.fn(),
	unfollowReadTagMutation: vi.fn(),
} ) );

// ── Shared step indicator (not under test here) ──────────────────────────────

vi.mock( 'calypso/reader/components/step-indicator', () => ( {
	StepIndicator: () => null,
} ) );

// ── Tests ────────────────────────────────────────────────────────────────────

describe( 'InterestsModal – verification nudge', () => {
	it( 'does not render the verification nudge when promptVerification is false', () => {
		renderWithProvider(
			<InterestsModal
				onContinue={ vi.fn() }
				promptVerification={ false }
				hasFollowed={ false }
				onFollowed={ vi.fn() }
			/>
		);

		expect( screen.queryByTestId( 'interests-verification-nudge' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the verification nudge when promptVerification is true', () => {
		renderWithProvider(
			<InterestsModal
				onContinue={ vi.fn() }
				promptVerification
				hasFollowed={ false }
				onFollowed={ vi.fn() }
			/>
		);

		expect( screen.getByTestId( 'interests-verification-nudge' ) ).toBeVisible();
	} );

	it( 'removes interest controls from keyboard access while verification is required', () => {
		renderWithProvider(
			<InterestsModal
				onContinue={ vi.fn() }
				promptVerification
				hasFollowed={ false }
				onFollowed={ vi.fn() }
			/>
		);

		const content = document.querySelector( '.interests-modal__content' );
		expect( content ).toHaveAttribute( 'inert' );
		expect( content ).not.toContainElement( screen.getByRole( 'button', { name: 'Continue' } ) );
	} );

	it( 'disables the Continue button when promptVerification is true', () => {
		renderWithProvider(
			<InterestsModal
				onContinue={ vi.fn() }
				promptVerification
				hasFollowed={ false }
				onFollowed={ vi.fn() }
			/>
		);

		// accessibleWhenDisabled renders aria-disabled instead of the native disabled attribute.
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'does not invoke onContinue when Continue is clicked while verification is required', async () => {
		const user = userEvent.setup();
		const onContinue = vi.fn();

		renderWithProvider(
			<InterestsModal
				onContinue={ onContinue }
				promptVerification
				hasFollowed={ false }
				onFollowed={ vi.fn() }
			/>
		);

		// The button is aria-disabled; userEvent still fires a click event but the
		// component's onClick guard should prevent calling onContinue.
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).not.toHaveBeenCalled();
	} );

	it( 'disables the Continue button from tag count when promptVerification is false and no tags are followed', () => {
		renderWithProvider(
			<InterestsModal
				onContinue={ vi.fn() }
				promptVerification={ false }
				hasFollowed={ false }
				onFollowed={ vi.fn() }
			/>
		);

		// Still disabled (< 3 tags), but the nudge is absent.
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.queryByTestId( 'interests-verification-nudge' ) ).not.toBeInTheDocument();
	} );

	it( 'enables the Continue button when hasFollowed is true even with no followed tags', () => {
		// Mirrors the parent passing `hasFollowed={ true }` on a remount after
		// the user already subscribed in an earlier visit to this step.
		renderWithProvider(
			<InterestsModal
				onContinue={ vi.fn() }
				promptVerification={ false }
				hasFollowed
				onFollowed={ vi.fn() }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).not.toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );
} );

describe( 'InterestsModal – most subscribed pack', () => {
	const fivePackBlogs = Array.from( { length: 5 }, ( _, i ) => ( {
		feed_ID: 900 + i,
		site_ID: 800 + i,
		site_URL: `https://pack-${ i }.example`,
		site_name: `Pack site ${ i }`,
		feed_URL: `https://pack-${ i }.example/feed`,
		has_icon: true,
	} ) );

	afterEach( () => {
		vi.mocked( getTopicGroups ).mockReset().mockReturnValue( [] );
	} );

	it( 'renders the tagless pack with blog count from packBlogsById and enables Continue after subscribe', async () => {
		const user = userEvent.setup();

		vi.mocked( getTopicGroups ).mockReturnValue( [
			{
				id: 'most-subscribed',
				title: 'Most Subscribed',
				description: 'Popular reads.',
				imageUrl: 'https://images.example/subscribed.webp',
				tags: [],
			},
		] );

		// Uses the stateful wrapper so the pack-subscribe `onFollowed` callback
		// flows back through `hasFollowed` and relaxes the Continue gate, the
		// same way the real parent (`ReaderOnboardingRsm`) does it.
		// `packBlogsById` is now passed as a prop (owned by the parent) rather
		// than computed inside `InterestsModal` via `getPackBlogs`.
		renderWithProvider(
			<InterestsModalWithFollowedState
				onContinue={ vi.fn() }
				promptVerification={ false }
				packBlogsById={ new Map( [ [ 'most-subscribed', fivePackBlogs ] ] ) }
			/>
		);

		const packCard = screen.getByTestId( 'topic-pack-card' );
		expect( packCard ).toHaveAttribute( 'data-title', 'Most Subscribed' );
		expect( packCard ).toHaveAttribute( 'data-blog-count', '5' );

		await user.click( packCard );

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).not.toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );
} );

describe( 'InterestsModal – analytics for pack subscribe', () => {
	const packBlogs = Array.from( { length: 3 }, ( _, i ) => ( {
		feed_ID: 900 + i,
		site_ID: 800 + i,
		site_URL: `https://pack-${ i }.example`,
		site_name: `Pack site ${ i }`,
		feed_URL: `https://pack-${ i }.example/feed`,
		has_icon: true,
	} ) );

	beforeEach( () => {
		vi.mocked( recordTracksEvent ).mockClear();
		vi.mocked( recordFollow ).mockClear();
		vi.mocked( recordReaderTracksEvent ).mockClear();
		mockFollowMutate.mockClear();
	} );

	afterEach( () => {
		vi.mocked( getTopicGroups ).mockReset().mockReturnValue( [] );
	} );

	it( 'records pack_subscribed with pack_id when a pack is subscribed', async () => {
		const user = userEvent.setup();

		vi.mocked( getTopicGroups ).mockReturnValue( [
			{
				id: 'most-subscribed',
				title: 'Most Subscribed',
				description: 'Popular reads.',
				imageUrl: 'https://images.example/subscribed.webp',
				tags: [],
			},
		] );

		renderWithProvider(
			<InterestsModalWithFollowedState
				onContinue={ vi.fn() }
				promptVerification={ false }
				packBlogsById={ new Map( [ [ 'most-subscribed', packBlogs ] ] ) }
			/>
		);

		await user.click( screen.getByTestId( 'topic-pack-card' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_onboarding_interests_modal_pack_subscribed',
			expect.objectContaining( {
				pack_id: 'most-subscribed',
				tag_count: 0,
				blog_count: packBlogs.length,
			} )
		);
	} );

	it( 'records calypso_reader_site_followed with reader-onboarding-modal follow_source for each pack blog', async () => {
		const user = userEvent.setup();

		vi.mocked( getTopicGroups ).mockReturnValue( [
			{
				id: 'most-subscribed',
				title: 'Most Subscribed',
				description: 'Popular reads.',
				imageUrl: 'https://images.example/subscribed.webp',
				tags: [],
			},
		] );

		renderWithProvider(
			<InterestsModalWithFollowedState
				onContinue={ vi.fn() }
				promptVerification={ false }
				packBlogsById={ new Map( [ [ 'most-subscribed', packBlogs ] ] ) }
			/>
		);

		await user.click( screen.getByTestId( 'topic-pack-card' ) );

		expect( recordFollow ).toHaveBeenCalledTimes( packBlogs.length );
		expect( mockFollowMutate ).toHaveBeenCalledTimes( packBlogs.length );
		for ( const blog of packBlogs ) {
			expect( mockFollowMutate ).toHaveBeenCalledWith( {
				feedUrl: blog.feed_URL,
				source: READER_ONBOARDING_FOLLOW_SOURCE,
			} );
			expect( recordFollow ).toHaveBeenCalledWith( blog.feed_URL, undefined, {
				follow_source: 'reader-onboarding-modal',
			} );
		}
	} );

	it( 'records calypso_reader_reader_tag_followed via recordReaderTracksEvent for each tag in the pack', async () => {
		const user = userEvent.setup();

		vi.mocked( getTopicGroups ).mockReturnValue( [
			{
				id: 'tech',
				title: 'Tech',
				description: 'Tech reads.',
				imageUrl: 'https://images.example/tech.webp',
				tags: [ 'javascript', 'react' ],
			},
		] );

		renderWithProvider(
			<InterestsModalWithFollowedState
				onContinue={ vi.fn() }
				promptVerification={ false }
				packBlogsById={ new Map( [ [ 'tech', [] ] ] ) }
			/>
		);

		await user.click( screen.getByTestId( 'topic-pack-card' ) );

		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_reader_tag_followed',
			expect.objectContaining( {
				tag: 'javascript',
				follow_source: 'reader-onboarding-modal',
			} )
		);
		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_reader_tag_followed',
			expect.objectContaining( {
				tag: 'react',
				follow_source: 'reader-onboarding-modal',
			} )
		);
	} );
} );
