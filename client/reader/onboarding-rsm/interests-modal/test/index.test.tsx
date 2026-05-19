/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { getPackBlogs } from '../get-pack-blogs';
import InterestsModal from '../index';
import { getTopicGroups } from '../topic-groups';

// The parent owns `hasFollowed` so it persists across remounts of this modal.
// Most tests don't care about that flag (they exercise the initial false case)
// and pass `hasFollowed={ false }` + a noop `onFollowed`. Tests that need the
// flag to flip in response to a user action mount this wrapper, which mirrors
// what the parent does.
type InterestsModalProps = React.ComponentProps< typeof InterestsModal >;
const InterestsModalWithFollowedState = (
	props: Omit< InterestsModalProps, 'hasFollowed' | 'onFollowed' >
) => {
	const [ hasFollowed, setHasFollowed ] = useState( false );
	return (
		<InterestsModal
			{ ...props }
			hasFollowed={ hasFollowed }
			onFollowed={ () => setHasFollowed( true ) }
		/>
	);
};

// ── External data hooks ──────────────────────────────────────────────────────

jest.mock( 'calypso/data/reader/use-reader-interest-tags', () => ( {
	useReaderInterestTags: () => [],
} ) );

jest.mock( 'calypso/data/reader/use-reader-tags', () => ( {
	useFollowedReaderTags: () => ( { data: [] } ),
} ) );

// ── Internal helpers / child components ─────────────────────────────────────

jest.mock( '../get-pack-blogs', () => ( {
	getPackBlogs: jest.fn( () => [] ),
} ) );

jest.mock( '../topic-groups', () => ( {
	getTopicGroups: jest.fn( () => [] ),
} ) );

jest.mock( '../topic-group-card', () => {
	const React = require( 'react' );
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

// ── Redux / state ────────────────────────────────────────────────────────────

jest.mock( 'calypso/state/reader/follows/selectors', () => ( {
	getReaderFollows: jest.fn().mockReturnValue( [] ),
} ) );

jest.mock( 'calypso/state/reader/follows/actions', () => ( {
	follow: jest.fn( () => ( { type: 'READER_FOLLOW' } ) ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn( () => ( { type: 'NOTICES_ERROR' } ) ),
} ) );

// ── Analytics / i18n ────────────────────────────────────────────────────────

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	fixMe: ( { newCopy }: { newCopy: string } ) => newCopy,
} ) );

// ── TanStack / mutations ─────────────────────────────────────────────────────

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useMutation: () => ( { mutateAsync: jest.fn() } ),
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
		jest.mocked( getPackBlogs ).mockReset().mockReturnValue( [] );
	} );

	it( 'renders the tagless pack with blog count from getPackBlogs( [], { directKey } ) and enables Continue after subscribe', async () => {
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

		jest.mocked( getPackBlogs ).mockImplementation( ( tags, opts ) => {
			expect( tags ).toEqual( [] );
			expect( opts ).toEqual( { directKey: 'most-subscribed' } );
			return fivePackBlogs;
		} );

		// Uses the stateful wrapper so the pack-subscribe `onFollowed` callback
		// flows back through `hasFollowed` and relaxes the Continue gate, the
		// same way the real parent (`ReaderOnboardingRsm`) does it.
		renderWithProvider(
			<InterestsModalWithFollowedState onContinue={ jest.fn() } promptVerification={ false } />
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
