/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { getAddSiteDomainUrl } from '../../../utils/domain-url';
import SiteLaunchCelebrationModal from '../index';
import type { DomainSummary, Site } from '@automattic/api-core';

const createMockSite = ( options: Partial< Site > = {} ): Site =>
	( {
		ID: 1,
		slug: 'test-site.wordpress.com',
		URL: 'https://test-site.wordpress.com',
		launch_status: 'launched' as const,
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

const mockDomainsApi = ( domains: DomainSummary[] = [] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
};

const setupCelebrateLaunchUrl = () => {
	// Set the URL to include the celebrateLaunch param so the modal opens
	const url = new URL( window.location.href );
	url.searchParams.set( 'celebrateLaunch', 'true' );
	window.history.pushState( {}, '', url.toString() );
};

describe( '<SiteLaunchCelebrationModal>', () => {
	beforeEach( () => {
		mockDomainsApi( [] );
	} );

	describe( 'Modal Display', () => {
		test( 'renders modal with proper structure when conditions are met', async () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			expect( await screen.findByRole( 'dialog' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Copy URL' } ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'View site' } ) ).toBeVisible();
		} );

		test( 'does not render modal when celebrateLaunch param is missing', () => {
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// Modal should not be rendered
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );

		test( 'does not render modal when site launch_status is not launched', () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite( { launch_status: 'unlaunched' as const } );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// Modal should not be rendered
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );

		test( 'renders modal when launch_status is false (API missing option) and celebrateLaunch is present', async () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite( { launch_status: false } );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			expect( await screen.findByRole( 'dialog' ) ).toBeVisible();
		} );
	} );

	describe( 'Domain Selection Logic', () => {
		test( 'copies custom domain to clipboard when available', async () => {
			setupCelebrateLaunchUrl();
			const user = userEvent.setup();
			const mockSite = createMockSite();
			const customDomain = createMockDomain( 'example.com', true );

			nock.cleanAll();
			mockDomainsApi( [ customDomain ] );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			await screen.findByText( 'example.com' );
			await user.click( screen.getByRole( 'button', { name: 'Copy URL' } ) );

			expect( await navigator.clipboard.readText() ).toBe( 'example.com' );
		} );

		test( 'copies first domain when multiple domains exist', async () => {
			setupCelebrateLaunchUrl();
			const user = userEvent.setup();
			const mockSite = createMockSite();
			const domain1 = createMockDomain( 'first.com', true );
			const domain2 = createMockDomain( 'second.com', true );

			nock.cleanAll();
			mockDomainsApi( [ domain1, domain2 ] );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			await screen.findByText( 'first.com' );
			await user.click( screen.getByRole( 'button', { name: 'Copy URL' } ) );

			// Should copy first domain, not second
			expect( await navigator.clipboard.readText() ).toBe( 'first.com' );
		} );

		test( 'skips domains without active subscription', async () => {
			setupCelebrateLaunchUrl();
			const user = userEvent.setup();
			const mockSite = createMockSite();
			const unsubscribedDomain = createMockDomain( 'unsubscribed.com', false );
			const activeDomain = createMockDomain( 'active.com', true );

			nock.cleanAll();
			mockDomainsApi( [ unsubscribedDomain, activeDomain ] );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			await screen.findByText( 'active.com' );
			await user.click( screen.getByRole( 'button', { name: 'Copy URL' } ) );

			// Should skip unsubscribed domain and use the active one
			expect( await navigator.clipboard.readText() ).toBe( 'active.com' );
		} );
	} );

	describe( 'Query Parameter Removal', () => {
		test( 'removes celebrateLaunch query param when modal closes', async () => {
			setupCelebrateLaunchUrl();
			const user = userEvent.setup();
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// Wait for modal to render
			await screen.findByRole( 'dialog' );

			// Close the modal
			await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

			// After component mounts and modal opens, the URL should not contain celebrateLaunch param
			await waitFor( () => {
				expect( window.location.href ).not.toContain( 'celebrateLaunch' );
			} );
		} );
	} );

	describe( 'Copy Button Behavior', () => {
		test( 'copies domain to clipboard and provides feedback', async () => {
			setupCelebrateLaunchUrl();
			const user = userEvent.setup();
			const mockSite = createMockSite();

			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			const copyButton = await screen.findByRole( 'button', { name: 'Copy URL' } );

			// Initial title should be "Copy URL"
			expect( copyButton ).toHaveAttribute( 'title', 'Copy URL' );

			// Click button
			await user.click( copyButton );

			// Verify clipboard was written to
			expect( await navigator.clipboard.readText() ).toBe( mockSite.slug );

			// After click, title should change to "Copied!"
			expect( copyButton ).toHaveAttribute( 'title', 'Copied!' );
		} );
	} );

	describe( 'View Site Navigation', () => {
		test( 'view site link uses site URL and opens in new tab', async () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite( { URL: 'https://mysite.wordpress.com' } );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// Wait for modal to render
			await screen.findByRole( 'dialog' );

			const viewLink = screen.getByRole( 'link', { name: 'View site' } );
			expect( viewLink ).toHaveAttribute( 'href', 'https://mysite.wordpress.com' );
			expect( viewLink ).toHaveAttribute( 'target', '_blank' );
		} );

		test( 'renders button instead of link when URL is missing', async () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite( { URL: undefined } );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// When href is undefined, WordPress Button renders as a button element, not a link
			// Wait for the dialog to be sure the component rendered
			await screen.findByRole( 'dialog' );
			const viewButton = screen.getByRole( 'button', { name: 'View site' } );
			expect( viewButton ).toBeVisible();
		} );
	} );

	describe( 'Upsell Display Logic', () => {
		test( 'shows upsell when no custom domain exists and plan is free', async () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite( {
				plan: {
					product_id: 1,
					product_slug: 'free_plan',
					product_name_short: 'Free',
					product_name_en: 'WordPress.com Free',
					expired: false,
					is_free: true,
					features: { active: [] },
				},
			} );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// Wait for modal to render first
			await screen.findByRole( 'dialog' );

			// Upsell button should appear for free plan without custom domain
			await screen.findByRole( 'link', { name: 'Get your domain' } );
			expect( screen.getByRole( 'link', { name: 'Get your domain' } ) ).toHaveAttribute(
				'href',
				getAddSiteDomainUrl( mockSite.slug )
			);
		} );

		test( 'does not show upsell when custom domain exists', async () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite( {
				plan: {
					product_id: 1,
					product_slug: 'free_plan',
					product_name_short: 'Free',
					product_name_en: 'WordPress.com Free',
					expired: false,
					is_free: true,
					features: { active: [] },
				},
			} );
			const customDomain = createMockDomain( 'example.com', true );

			nock.cleanAll();
			mockDomainsApi( [ customDomain ] );
			render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// Wait for the domain to appear, confirming the API response is loaded
			await screen.findByText( 'example.com' );

			// Upsell button should NOT appear when custom domain is present
			expect( screen.queryByRole( 'link', { name: 'Get your domain' } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Analytics Tracking', () => {
		test( 'tracks celebration modal view when modal opens', async () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite();
			const { recordTracksEvent } = render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// Wait for modal to render and analytics to fire
			await screen.findByRole( 'dialog' );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_launchpad_celebration_modal_view',
				{
					product_slug: 'business-monthly',
				}
			);
		} );

		test( 'still fires modal view event when site has no plan', async () => {
			setupCelebrateLaunchUrl();
			const mockSite = createMockSite( { plan: undefined } );
			const { recordTracksEvent } = render( <SiteLaunchCelebrationModal site={ mockSite } /> );

			// Wait for modal to render and analytics to fire
			await screen.findByRole( 'dialog' );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_launchpad_celebration_modal_view',
				{
					product_slug: undefined,
				}
			);
		} );
	} );
} );
