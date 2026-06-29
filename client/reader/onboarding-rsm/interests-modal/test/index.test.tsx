/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { READER_ONBOARDING_FOLLOW_SOURCE } from 'calypso/reader/onboarding-rsm/constants';
import { recordFollow } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import InterestsModal from '../index';
import { getTopicGroups } from '../topic-groups';

const mockFollowMutate = jest.fn();

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

jest.mock( 'calypso/data/reader/use-reader-interest-tags', () => ( {
	useReaderInterestTags: () => [],
} ) );

jest.mock( 'calypso/reader/data/tags', () => ( {
	useFollowedTags: () => ( { data: [] } ),
} ) );

// ── Internal helpers / child components ─────────────────────────────────────

jest.mock( '../topic-groups', () => ( {
	getTopicGroups: jest.fn( () => [] ),
} ) );

jest.mock( '../topic-group-card', () => {
	const React = jest.requireActual( 'react' );
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
jest.mock( '../verificationNudge', () => ( {
	__esModule: true,
	default: () => <div data-testid="interests-verification-nudge" />,
} ) );

// ── State hooks ──────────────────────────────────────────────────────────────

jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	getFollowingSource: jest.fn( () => 'test-source' ),
	useFollowSite: jest.fn( () => ( {
		mutate: mockFollowMutate,
		mutateAsync: mockFollowMutate,
		isPending: false,
	} ) ),
	useUnfollowSite: jest.fn(),
	useIsSubscribed: jest.fn( () => false ),
	useSiteSubscriptions: jest.fn( () => ( { subscriptions: [], refetch: jest.fn() } ) ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn( () => ( { type: 'NOTICES_ERROR' } ) ),
} ) );

// ── Analytics / i18n ────────────────────────────────────────────────────────

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// Mock as a thunk action creator so `dispatch( recordReaderTracksEvent(...) )`
// still works inside `renderWithProvider`, while letting tests assert on the
// call arguments.
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn(
		( name: string, properties: Record< string, unknown > ) => () => ( {
			type: 'READER_RECORD_TRACKS_EVENT',
			name,
			properties,
		} )
	),
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	recordFollow: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	fixMe: ( { newCopy }: { newCopy: string } ) => newCopy,
} ) );

// ── TanStack / mutations ─────────────────────────────────────────────────────

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useMutation: () => ( { mutateAsync: jest.fn().mockResolvedValue( undefined ) } ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	followReadTagMutation: jest.fn(),
	unfollowReadTagMutation: jest.fn(),
} ) );

// ── Shared step indicator (not under test here) ──────────────────────────────

jest.mock( 'calypso/reader/onboarding-rsm/step-indicator', () => ( {
	StepIndicator: () => null,
} ) );

// ── Tests ────────────────────────────────────────────────────────────────────

describe( 'InterestsModal – verification nudge', () => {
	it( 'does not render the verification nudge when promptVerification is false', () => {
		renderWithProvider(
			<InterestsModal
				onContinue={ jest.fn() }
				promptVerification={ false }
				hasFollowed={ false }
				onFollowed={ jest.fn() }
			/>
		);

		expect( screen.queryByTestId( 'interests-verification-nudge' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the verification nudge when promptVerification is true', () => {
		renderWithProvider(
			<InterestsModal
				onContinue={ jest.fn() }
				promptVerification
				hasFollowed={ false }
				onFollowed={ jest.fn() }
			/>
		);

		expect( screen.getByTestId( 'interests-verification-nudge' ) ).toBeVisible();
	} );

	it( 'disables the Continue button when promptVerification is true', () => {
		renderWithProvider(
			<InterestsModal
				onContinue={ jest.fn() }
				promptVerification
				hasFollowed={ false }
				onFollowed={ jest.fn() }
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
		const onContinue = jest.fn();

		renderWithProvider(
			<InterestsModal
				onContinue={ onContinue }
				promptVerification
				hasFollowed={ false }
				onFollowed={ jest.fn() }
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
				onContinue={ jest.fn() }
				promptVerification={ false }
				hasFollowed={ false }
				onFollowed={ jest.fn() }
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
				onContinue={ jest.fn() }
				promptVerification={ false }
				hasFollowed
				onFollowed={ jest.fn() }
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
		jest.mocked( getTopicGroups ).mockReset().mockReturnValue( [] );
	} );

	it( 'renders the tagless pack with blog count from packBlogsById and enables Continue after subscribe', async () => {
		const user = userEvent.setup();

		jest.mocked( getTopicGroups ).mockReturnValue( [
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
				onContinue={ jest.fn() }
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
		jest.mocked( recordTracksEvent ).mockClear();
		jest.mocked( recordFollow ).mockClear();
		jest.mocked( recordReaderTracksEvent ).mockClear();
		mockFollowMutate.mockClear();
	} );

	afterEach( () => {
		jest.mocked( getTopicGroups ).mockReset().mockReturnValue( [] );
	} );

	it( 'records pack_subscribed with pack_id when a pack is subscribed', async () => {
		const user = userEvent.setup();

		jest.mocked( getTopicGroups ).mockReturnValue( [
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
				onContinue={ jest.fn() }
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

		jest.mocked( getTopicGroups ).mockReturnValue( [
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
				onContinue={ jest.fn() }
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

		jest.mocked( getTopicGroups ).mockReturnValue( [
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
				onContinue={ jest.fn() }
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
		// Confirm the legacy onboarding-specific event name is no longer used.
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_reader_onboarding_interests_modal_tag_followed',
			expect.anything()
		);
	} );
} );
