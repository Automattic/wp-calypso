/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import InterestsModal from '../index';

// ── External data hooks ──────────────────────────────────────────────────────

jest.mock( 'calypso/data/reader/use-reader-interest-tags', () => ( {
	useReaderInterestTags: () => [],
} ) );

jest.mock( 'calypso/data/reader/use-reader-tags', () => ( {
	useFollowedReaderTags: () => ( { data: [] } ),
} ) );

// ── Internal helpers / child components ─────────────────────────────────────

jest.mock( '../get-pack-blogs', () => ( {
	getPackBlogs: () => [],
} ) );

jest.mock( '../topic-groups', () => ( {
	getTopicGroups: () => [],
} ) );

jest.mock( '../topic-group-card', () => ( {
	__esModule: true,
	default: () => null,
} ) );

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
		renderWithProvider( <InterestsModal onContinue={ jest.fn() } promptVerification={ false } /> );

		expect( screen.queryByTestId( 'interests-verification-nudge' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the verification nudge when promptVerification is true', () => {
		renderWithProvider( <InterestsModal onContinue={ jest.fn() } promptVerification /> );

		expect( screen.getByTestId( 'interests-verification-nudge' ) ).toBeVisible();
	} );

	it( 'disables the Continue button when promptVerification is true', () => {
		renderWithProvider( <InterestsModal onContinue={ jest.fn() } promptVerification /> );

		// accessibleWhenDisabled renders aria-disabled instead of the native disabled attribute.
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'does not invoke onContinue when Continue is clicked while verification is required', async () => {
		const user = userEvent.setup();
		const onContinue = jest.fn();

		renderWithProvider( <InterestsModal onContinue={ onContinue } promptVerification /> );

		// The button is aria-disabled; userEvent still fires a click event but the
		// component's onClick guard should prevent calling onContinue.
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).not.toHaveBeenCalled();
	} );

	it( 'disables the Continue button from tag count when promptVerification is false and no tags are followed', () => {
		renderWithProvider( <InterestsModal onContinue={ jest.fn() } promptVerification={ false } /> );

		// Still disabled (< 3 tags), but the nudge is absent.
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.queryByTestId( 'interests-verification-nudge' ) ).not.toBeInTheDocument();
	} );
} );
