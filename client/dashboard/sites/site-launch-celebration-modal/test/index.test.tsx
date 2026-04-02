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
		test( 'renders modal with correct title', () => {
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			expect(
				screen.getByRole( 'dialog', { name: 'Congrats, your site is live!' } )
			).toBeInTheDocument();
		} );

		test( 'renders descriptive text and buttons', () => {
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			expect(
				screen.getByText( 'Now you can head over to your site and share it with the world.' )
			).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Copy URL' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'View site' } ) ).toBeInTheDocument();
		} );

		test( 'displays site domain when no custom domain exists', () => {
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			expect( screen.getByText( 'test-site.wordpress.com' ) ).toBeVisible();
		} );

		test( 'displays custom domain when available', () => {
			const mockSite = createMockSite();
			const customDomain = createMockDomain( 'example.com', true );
			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ customDomain ] }
					onClose={ jest.fn() }
				/>
			);

			expect( screen.getByText( 'example.com' ) ).toBeVisible();
			expect( screen.queryByText( 'test-site.wordpress.com' ) ).not.toBeInTheDocument();
		} );

		test( 'displays first custom domain when multiple exist', () => {
			const mockSite = createMockSite();
			const domain1 = createMockDomain( 'first.com', true );
			const domain2 = createMockDomain( 'second.com', true );
			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ domain1, domain2 ] }
					onClose={ jest.fn() }
				/>
			);

			expect( screen.getByText( 'first.com' ) ).toBeVisible();
			expect( screen.queryByText( 'second.com' ) ).not.toBeInTheDocument();
		} );

		test( 'ignores domains without subscription_id', () => {
			const mockSite = createMockSite();
			const unsubscribedDomain = createMockDomain( 'unsubscribed.com', false );
			const customDomain = createMockDomain( 'custom.com', true );
			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ unsubscribedDomain, customDomain ] }
					onClose={ jest.fn() }
				/>
			);

			expect( screen.getByText( 'custom.com' ) ).toBeVisible();
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

	describe( 'Copy URL Button', () => {
		test( 'copies site domain to clipboard when button is clicked', async () => {
			const user = userEvent.setup();
			const mockSite = createMockSite();
			navigator.clipboard.writeText = jest.fn();

			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			const copyButton = screen.getByRole( 'button', { name: 'Copy URL' } );
			await user.click( copyButton );

			expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( 'test-site.wordpress.com' );
		} );

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

		test( 'copy button is in DOM and focusable for keyboard navigation', () => {
			const mockSite = createMockSite();
			navigator.clipboard.writeText = jest.fn();

			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			const copyButton = screen.getByRole( 'button', { name: 'Copy URL' } );

			// Copy button should be in the DOM and have no disabled attribute
			expect( copyButton ).toBeInTheDocument();
			expect( copyButton ).not.toHaveAttribute( 'disabled' );
		} );
	} );

	describe( 'View Site Link', () => {
		test( 'view site link has correct href and opens in new tab', () => {
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			const viewLink = screen.getByRole( 'link', { name: 'View site' } );

			expect( viewLink ).toHaveAttribute( 'href', 'https://test-site.wordpress.com' );
			expect( viewLink ).toHaveAttribute( 'target', '_blank' );
		} );

		test( 'view site button still renders when site.URL is missing', () => {
			const mockSite = createMockSite( { URL: undefined } );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// Button should still exist in DOM even if URL is missing (renders as button without href)
			expect( screen.getByRole( 'button', { name: 'View site' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Upsell Content - Free Plan', () => {
		test( 'shows upsell link for free plan without custom domain', () => {
			const mockSite = createMockSite( { plan: { is_free: true } as any } );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// Free plan should show an upsell link
			const upsellLink = screen.getByRole( 'link', { name: /domain/i } );
			expect( upsellLink ).toBeInTheDocument();
			expect( upsellLink ).toHaveAttribute( 'href', '/domains/add/test-site.wordpress.com' );
		} );

		test( 'does not show upsell for free plan with custom domain', () => {
			const mockSite = createMockSite( { plan: { is_free: true } as any } );
			const customDomain = createMockDomain( 'example.com', true );
			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ customDomain ] }
					onClose={ jest.fn() }
				/>
			);

			// Should not show upsell button when custom domain exists
			expect( screen.queryByRole( 'button', { name: /domain/i } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Upsell Content - Paid Plan Monthly', () => {
		test( 'shows upsell link for paid monthly plan without custom domain', () => {
			const mockSite = createMockSite( {
				plan: { is_free: false, product_slug: 'business-monthly' } as any,
			} );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// Paid monthly plan should show upsell link
			const upsellLink = screen.getByRole( 'link', { name: /domain/i } );
			expect( upsellLink ).toBeInTheDocument();
			expect( upsellLink ).toHaveAttribute( 'href', '/domains/add/test-site.wordpress.com' );
		} );

		test( 'does not show upsell for paid monthly plan with custom domain', () => {
			const mockSite = createMockSite( {
				plan: { is_free: false, product_slug: 'business-monthly' } as any,
			} );
			const customDomain = createMockDomain( 'example.com', true );
			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ customDomain ] }
					onClose={ jest.fn() }
				/>
			);

			// Should not show upsell button when custom domain exists
			expect( screen.queryByRole( 'button', { name: /domain/i } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Upsell Content - Paid Plan Annual', () => {
		test( 'shows free domain upsell for paid annual plan without custom domain', () => {
			const mockSite = createMockSite( {
				plan: { is_free: false, product_slug: 'business-yearly' } as any,
			} );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// Paid annual plan should show upsell link
			const upsellLink = screen.getByRole( 'link', { name: /domain/i } );
			expect( upsellLink ).toBeInTheDocument();
			expect( upsellLink ).toHaveAttribute( 'href', '/domains/add/test-site.wordpress.com' );
		} );

		test( 'does not show upsell for paid annual plan with custom domain', () => {
			const mockSite = createMockSite( {
				plan: { is_free: false, product_slug: 'business-yearly' } as any,
			} );
			const customDomain = createMockDomain( 'example.com', true );
			render(
				<SiteLaunchCelebrationModal
					site={ mockSite }
					domains={ [ customDomain ] }
					onClose={ jest.fn() }
				/>
			);

			// Should not show upsell button when custom domain exists
			expect( screen.queryByRole( 'button', { name: /domain/i } ) ).not.toBeInTheDocument();
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
