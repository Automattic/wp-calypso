/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { HelpCenterCTA } from '../help-center-cta';
import type { HelpCenterCTAVariant } from '../help-center-cta';

const mockRecordTracksEvent = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

// The impression dedupe set inside `help-center-cta.tsx` is module-level and
// persists across tests in this file, so every test needs its own cta_id.
let ctaIdCounter = 0;
function makeBaseProps() {
	ctaIdCounter += 1;
	return {
		ctaId: `onboarding-call-v1-${ ctaIdCounter }`,
		url: 'https://calendly.example.com/onboarding',
		title: 'Get set up with a free onboarding call',
		description: 'Talk one-on-one with a Happiness Engineer and get your new site off the ground.',
	};
}

describe( 'HelpCenterCTA', () => {
	afterEach( () => {
		mockRecordTracksEvent.mockClear();
	} );

	describe( 'banner variant', () => {
		it( 'renders title, description, and actionLabel from props', () => {
			const baseProps = makeBaseProps();
			render(
				<HelpCenterCTA { ...baseProps } variant="banner" actionLabel="Book your free call" />
			);

			expect( screen.getByText( baseProps.title ) ).toBeVisible();
			expect( screen.getByText( baseProps.description ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Book your free call' } ) ).toBeVisible();
		} );

		it( 'fires the impression event exactly once on mount', () => {
			const baseProps = makeBaseProps();
			render(
				<HelpCenterCTA { ...baseProps } variant="banner" actionLabel="Book your free call" />
			);

			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_impression', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: 'help-center-home',
				locale: 'en',
			} );
		} );

		it( 'fires the click event with the same payload when clicked', async () => {
			const baseProps = makeBaseProps();
			const user = userEvent.setup();
			render(
				<HelpCenterCTA { ...baseProps } variant="banner" actionLabel="Book your free call" />
			);
			mockRecordTracksEvent.mockClear();

			await user.click( screen.getByRole( 'link', { name: 'Book your free call' } ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_click', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: 'help-center-home',
				locale: 'en',
			} );
		} );

		it( 'opens the link in a new tab without a referrer', () => {
			const baseProps = makeBaseProps();
			render(
				<HelpCenterCTA { ...baseProps } variant="banner" actionLabel="Book your free call" />
			);

			const link = screen.getByRole( 'link', { name: 'Book your free call' } );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'noreferrer' );
		} );

		it( 'makes the whole banner a single link when actionLabel is not provided', () => {
			const baseProps = makeBaseProps();
			render( <HelpCenterCTA { ...baseProps } variant="banner" /> );

			const link = screen.getByRole( 'link' );
			expect( link ).toHaveAttribute( 'href', baseProps.url );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'noreferrer' );
			expect( link ).toHaveTextContent( baseProps.title );
			expect( link ).toHaveTextContent( baseProps.description );
		} );

		it( 'still fires the impression event when actionLabel is not provided', () => {
			const baseProps = makeBaseProps();
			render( <HelpCenterCTA { ...baseProps } variant="banner" /> );

			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_impression', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: 'help-center-home',
				locale: 'en',
			} );
		} );

		it( 'fires the click event when the whole-banner link is clicked', async () => {
			const baseProps = makeBaseProps();
			const user = userEvent.setup();
			render( <HelpCenterCTA { ...baseProps } variant="banner" /> );
			mockRecordTracksEvent.mockClear();

			await user.click( screen.getByRole( 'link' ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_click', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: 'help-center-home',
				locale: 'en',
			} );
		} );
	} );

	describe( 'unregistered variant', () => {
		it( 'renders nothing and fires no Tracks event', () => {
			const baseProps = makeBaseProps();
			const { container } = render(
				<HelpCenterCTA
					{ ...baseProps }
					variant={ 'not-a-real-variant' as unknown as HelpCenterCTAVariant }
				/>
			);

			expect( container ).toBeEmptyDOMElement();
			expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'link-list-item variant', () => {
		it( 'renders title and description from props', () => {
			const baseProps = makeBaseProps();
			render(
				<ul>
					<HelpCenterCTA { ...baseProps } variant="link-list-item" />
				</ul>
			);

			expect( screen.getByText( baseProps.title ) ).toBeVisible();
			expect( screen.getByText( baseProps.description ) ).toBeVisible();
		} );

		it( 'fires the impression event exactly once on mount', () => {
			const baseProps = makeBaseProps();
			render(
				<ul>
					<HelpCenterCTA { ...baseProps } variant="link-list-item" />
				</ul>
			);

			expect( mockRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_impression', {
				cta_id: baseProps.ctaId,
				variant: 'link-list-item',
				placement: 'help-center-more-resources',
				locale: 'en',
			} );
		} );

		it( 'fires the click event with the same payload when clicked', async () => {
			const baseProps = makeBaseProps();
			const user = userEvent.setup();
			render(
				<ul>
					<HelpCenterCTA { ...baseProps } variant="link-list-item" />
				</ul>
			);
			mockRecordTracksEvent.mockClear();

			await user.click( screen.getByRole( 'link' ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_click', {
				cta_id: baseProps.ctaId,
				variant: 'link-list-item',
				placement: 'help-center-more-resources',
				locale: 'en',
			} );
		} );

		it( 'opens the link in a new tab without a referrer', () => {
			const baseProps = makeBaseProps();
			render(
				<ul>
					<HelpCenterCTA { ...baseProps } variant="link-list-item" />
				</ul>
			);

			const link = screen.getByRole( 'link' );
			expect( link ).toHaveAttribute( 'target', '_blank' );
			expect( link ).toHaveAttribute( 'rel', 'noreferrer' );
		} );
	} );

	describe( 'impression deduplication', () => {
		it( 'fires exactly one impression when the same cta_id unmounts and remounts', () => {
			const baseProps = makeBaseProps();
			const { unmount } = render( <HelpCenterCTA { ...baseProps } variant="banner" /> );
			unmount();

			render( <HelpCenterCTA { ...baseProps } variant="banner" /> );

			const impressionCalls = mockRecordTracksEvent.mock.calls.filter(
				( [ eventName ] ) => eventName === 'calypso_helpcenter_cta_impression'
			);
			expect( impressionCalls ).toHaveLength( 1 );
		} );

		it( 'fires a second impression when a mounted component receives a new cta_id', () => {
			const firstProps = makeBaseProps();
			const secondProps = makeBaseProps();
			const { rerender } = render( <HelpCenterCTA { ...firstProps } variant="banner" /> );

			rerender( <HelpCenterCTA { ...secondProps } variant="banner" /> );

			const impressionCalls = mockRecordTracksEvent.mock.calls.filter(
				( [ eventName ] ) => eventName === 'calypso_helpcenter_cta_impression'
			);
			expect( impressionCalls ).toHaveLength( 2 );
			expect( impressionCalls[ 1 ][ 1 ] ).toMatchObject( { cta_id: secondProps.ctaId } );
		} );

		it( 'never dedupes clicks: two clicks fire two click events', async () => {
			const baseProps = makeBaseProps();
			const user = userEvent.setup();
			render( <HelpCenterCTA { ...baseProps } variant="banner" /> );
			mockRecordTracksEvent.mockClear();

			const link = screen.getByRole( 'link' );
			await user.click( link );
			await user.click( link );

			const clickCalls = mockRecordTracksEvent.mock.calls.filter(
				( [ eventName ] ) => eventName === 'calypso_helpcenter_cta_click'
			);
			expect( clickCalls ).toHaveLength( 2 );
		} );
	} );

	describe( 'day-of-window and campaign properties', () => {
		beforeEach( () => {
			jest.useFakeTimers();
			jest.setSystemTime( new Date( '2026-07-29T00:00:00Z' ) );
		} );

		afterEach( () => {
			jest.useRealTimers();
		} );

		function setupUserEvent() {
			return userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		}

		it( 'includes days_since_purchase, plan_family, and locale on the impression', () => {
			const baseProps = makeBaseProps();
			const purchasedAt = Math.floor( Date.now() / 1000 ) - 3 * 86400;

			render(
				<HelpCenterCTA
					{ ...baseProps }
					variant="banner"
					purchasedAt={ purchasedAt }
					planFamily="business"
				/>
			);

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_impression', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: 'help-center-home',
				plan_family: 'business',
				locale: 'en',
				days_since_purchase: 3,
			} );
		} );

		it( 'includes days_since_purchase, plan_family, and locale on the click', async () => {
			const user = setupUserEvent();
			const baseProps = makeBaseProps();
			const purchasedAt = Math.floor( Date.now() / 1000 ) - 3 * 86400;

			render(
				<HelpCenterCTA
					{ ...baseProps }
					variant="banner"
					purchasedAt={ purchasedAt }
					planFamily="business"
				/>
			);
			mockRecordTracksEvent.mockClear();

			await user.click( screen.getByRole( 'link' ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_helpcenter_cta_click', {
				cta_id: baseProps.ctaId,
				variant: 'banner',
				placement: 'help-center-home',
				plan_family: 'business',
				locale: 'en',
				days_since_purchase: 3,
			} );
		} );

		it( 'reports a later day on a click that happens days after the impression', async () => {
			const user = setupUserEvent();
			const baseProps = makeBaseProps();
			const purchasedAt = Math.floor( Date.now() / 1000 );

			render( <HelpCenterCTA { ...baseProps } variant="banner" purchasedAt={ purchasedAt } /> );

			const [ , impressionProps ] = mockRecordTracksEvent.mock.calls.find(
				( [ eventName ] ) => eventName === 'calypso_helpcenter_cta_impression'
			);
			mockRecordTracksEvent.mockClear();

			jest.setSystemTime( new Date( Date.now() + 3 * 86400 * 1000 ) );
			await user.click( screen.getByRole( 'link' ) );

			const [ , clickProps ] = mockRecordTracksEvent.mock.calls.find(
				( [ eventName ] ) => eventName === 'calypso_helpcenter_cta_click'
			);
			expect( clickProps.days_since_purchase ).toBeGreaterThan(
				impressionProps.days_since_purchase
			);
		} );

		it( 'clamps a purchase far in the past to day 29', () => {
			const baseProps = makeBaseProps();
			const purchasedAt = Math.floor( Date.now() / 1000 ) - 45 * 86400;

			render( <HelpCenterCTA { ...baseProps } variant="banner" purchasedAt={ purchasedAt } /> );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_helpcenter_cta_impression',
				expect.objectContaining( { days_since_purchase: 29 } )
			);
		} );

		it( 'clamps a purchase timestamp in the future to day 0', () => {
			const baseProps = makeBaseProps();
			const purchasedAt = Math.floor( Date.now() / 1000 ) + 86400;

			render( <HelpCenterCTA { ...baseProps } variant="banner" purchasedAt={ purchasedAt } /> );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_helpcenter_cta_impression',
				expect.objectContaining( { days_since_purchase: 0 } )
			);
		} );

		it( 'omits days_since_purchase from both events when purchasedAt is not supplied', async () => {
			const user = setupUserEvent();
			const baseProps = makeBaseProps();

			render( <HelpCenterCTA { ...baseProps } variant="banner" /> );

			const [ , impressionProps ] = mockRecordTracksEvent.mock.calls.find(
				( [ eventName ] ) => eventName === 'calypso_helpcenter_cta_impression'
			);
			expect( impressionProps ).not.toHaveProperty( 'days_since_purchase' );

			mockRecordTracksEvent.mockClear();
			await user.click( screen.getByRole( 'link' ) );

			const [ , clickProps ] = mockRecordTracksEvent.mock.calls.find(
				( [ eventName ] ) => eventName === 'calypso_helpcenter_cta_click'
			);
			expect( clickProps ).not.toHaveProperty( 'days_since_purchase' );
		} );
	} );
} );
