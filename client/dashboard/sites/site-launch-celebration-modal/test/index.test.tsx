/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import SiteLaunchCelebrationModal from '../index';
import type { DomainSummary, Site } from '@automattic/api-core';

const createMockSite = ( options: Partial< Site > = {} ): Site =>
	( {
		ID: 1,
		slug: 'test-site.wordpress.com',
		URL: 'https://test-site.wordpress.com',
		plan: {
			is_free: false,
			product_slug: 'business-monthly',
		},
		...options,
	} ) as Site;

const createMockDomain = ( domain: string, hasSubscription = true ): DomainSummary =>
	( {
		domain,
		blog_id: 1,
		subscription_id: hasSubscription ? 123 : null,
	} ) as DomainSummary;

describe( '<SiteLaunchCelebrationModal>', () => {
	describe( 'Modal Display', () => {
		test( 'renders modal with proper structure', () => {
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Copy URL' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'View site' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Domain Selection Logic', () => {
		test( 'copies custom domain to clipboard when available', async () => {
			const user = userEvent.setup();
			const mockSite = createMockSite();
			const customDomain = createMockDomain( 'example.com', true );
			navigator.clipboard.writeText = jest.fn();

			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ customDomain ] }
					onClose={ jest.fn() }
				/>
			);

			const copyButton = screen.getByRole( 'button', { name: 'Copy URL' } );
			await user.click( copyButton );

			expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( 'example.com' );
		} );

		test( 'copies first domain when multiple domains exist', async () => {
			const user = userEvent.setup();
			const mockSite = createMockSite();
			const domain1 = createMockDomain( 'first.com', true );
			const domain2 = createMockDomain( 'second.com', true );
			navigator.clipboard.writeText = jest.fn();

			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ domain1, domain2 ] }
					onClose={ jest.fn() }
				/>
			);

			const copyButton = screen.getByRole( 'button', { name: 'Copy URL' } );
			await user.click( copyButton );

			// Should copy first domain, not second
			expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( 'first.com' );
		} );

		test( 'skips domains without active subscription', async () => {
			const user = userEvent.setup();
			const mockSite = createMockSite();
			const unsubscribedDomain = createMockDomain( 'unsubscribed.com', false );
			const activeDomain = createMockDomain( 'active.com', true );
			navigator.clipboard.writeText = jest.fn();

			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ unsubscribedDomain, activeDomain ] }
					onClose={ jest.fn() }
				/>
			);

			const copyButton = screen.getByRole( 'button', { name: 'Copy URL' } );
			await user.click( copyButton );

			// Should skip unsubscribed domain and use the active one
			expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( 'active.com' );
		} );
	} );

	describe( 'Query Parameter Removal', () => {
		test( 'removes celebrateLaunch query param on mount', () => {
			const mockSite = createMockSite();
			const replaceStateSpy = jest.spyOn( window.history, 'replaceState' );

			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			expect( replaceStateSpy ).toHaveBeenCalledWith(
				null,
				'',
				expect.not.stringContaining( 'celebrateLaunch' )
			);

			replaceStateSpy.mockRestore();
		} );
	} );

	describe( 'Copy Button Behavior', () => {
		test( 'copies domain to clipboard and provides feedback', async () => {
			const user = userEvent.setup();
			const mockSite = createMockSite();
			navigator.clipboard.writeText = jest.fn();

			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			const copyButton = screen.getByRole( 'button', { name: 'Copy URL' } );

			// Button should be accessible
			expect( copyButton ).not.toHaveAttribute( 'disabled' );

			// Click and verify clipboard is called
			await user.click( copyButton );
			expect( navigator.clipboard.writeText ).toHaveBeenCalled();
		} );
	} );

	describe( 'View Site Navigation', () => {
		test( 'view site link uses site URL and opens in new tab', () => {
			const mockSite = createMockSite( { URL: 'https://mysite.wordpress.com' } );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			const viewLink = screen.getByRole( 'link', { name: 'View site' } );
			expect( viewLink ).toHaveAttribute( 'href', 'https://mysite.wordpress.com' );
			expect( viewLink ).toHaveAttribute( 'target', '_blank' );
		} );

		test( 'handles missing URL gracefully', () => {
			const mockSite = createMockSite( { URL: undefined } );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// Should render a button instead of link when URL is missing
			expect( screen.getByRole( 'button', { name: 'View site' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Upsell Display Logic', () => {
		test( 'shows upsell when no custom domain exists and plan is free', () => {
			const mockSite = createMockSite( { plan: { is_free: true } as any } );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// Upsell link should appear for free plan without custom domain
			const links = screen.getAllByRole( 'link' );
			const hasUpsellLink = links.some(
				( link ) => link.getAttribute( 'href' )?.includes( '/domains/add' )
			);
			expect( hasUpsellLink ).toBe( true );
		} );

		test( 'does not show upsell when custom domain exists', () => {
			const mockSite = createMockSite( { plan: { is_free: true } as any } );
			const customDomain = createMockDomain( 'example.com', true );
			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ customDomain ] }
					onClose={ jest.fn() }
				/>
			);

			// Upsell link should NOT appear when custom domain is present
			const links = screen.getAllByRole( 'link' );
			const hasUpsellLink = links.some(
				( link ) => link.getAttribute( 'href' )?.includes( '/domains/add' )
			);
			expect( hasUpsellLink ).toBe( false );
		} );
	} );

	describe( 'Analytics Tracking', () => {
		test( 'tracks celebration modal view on mount', () => {
			const mockSite = createMockSite();
			const { recordTracksEvent } = render(
				<SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } />
			);

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_launchpad_celebration_modal_view',
				{
					product_slug: 'business-monthly',
				}
			);
		} );

		test( 'tracks event with undefined product_slug when plan is missing', () => {
			const mockSite = createMockSite( { plan: undefined } );
			const { recordTracksEvent } = render(
				<SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } />
			);

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_launchpad_celebration_modal_view',
				{
					product_slug: undefined,
				}
			);
		} );
	} );
} );
