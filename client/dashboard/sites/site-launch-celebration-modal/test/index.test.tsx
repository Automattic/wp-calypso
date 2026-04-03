/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
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

const mockDomainsApi = ( domains: DomainSummary[] = [] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
};

describe( '<SiteLaunchCelebrationModal>', () => {
	beforeEach( () => {
		mockDomainsApi( [] );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	describe( 'Modal Display', () => {
		test( 'renders modal with proper structure', async () => {
			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			expect( screen.getByRole( 'dialog' ) ).toBeVisible();
			await screen.findByRole( 'button', { name: 'Copy URL' } );
			expect( screen.getByRole( 'link', { name: 'View site' } ) ).toBeVisible();
		} );
	} );

	describe( 'Domain Selection Logic', () => {
		test( 'copies custom domain to clipboard when available', async () => {
			const user = userEvent.setup();
			const mockSite = createMockSite();
			const customDomain = createMockDomain( 'example.com', true );
			navigator.clipboard.writeText = jest.fn();

			nock.cleanAll();
			mockDomainsApi( [ customDomain ] );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			await screen.findByText( 'example.com' );
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

			nock.cleanAll();
			mockDomainsApi( [ domain1, domain2 ] );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			await screen.findByText( 'first.com' );
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

			nock.cleanAll();
			mockDomainsApi( [ unsubscribedDomain, activeDomain ] );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			await screen.findByText( 'active.com' );
			const copyButton = screen.getByRole( 'button', { name: 'Copy URL' } );
			await user.click( copyButton );

			// Should skip unsubscribed domain and use the active one
			expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( 'active.com' );
		} );
	} );

	describe( 'Query Parameter Removal', () => {
		test( 'removes celebrateLaunch query param on mount', () => {
			// Store the original href to verify it changes
			const originalHref = window.location.href;
			window.history.pushState(
				{},
				'',
				originalHref + ( originalHref.includes( '?' ) ? '&' : '?' ) + 'celebrateLaunch=true'
			);

			const mockSite = createMockSite();
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// After component mounts, the URL should not contain celebrateLaunch param
			expect( window.location.href ).not.toContain( 'celebrateLaunch' );
		} );
	} );

	describe( 'Copy Button Behavior', () => {
		test( 'copies domain to clipboard and provides feedback', async () => {
			const user = userEvent.setup();
			const mockSite = createMockSite();
			navigator.clipboard.writeText = jest.fn();

			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			const copyButton = await screen.findByRole( 'button', { name: 'Copy URL' } );

			// Initial title should be "Copy URL"
			expect( copyButton ).toHaveAttribute( 'title', 'Copy URL' );

			// Click button
			await user.click( copyButton );

			// Verify clipboard was called
			expect( navigator.clipboard.writeText ).toHaveBeenCalled();

			// After click, title should change to "Copied!"
			expect( copyButton ).toHaveAttribute( 'title', 'Copied!' );
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

		test( 'renders button instead of link when URL is missing', async () => {
			const mockSite = createMockSite( { URL: undefined } );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// When href is undefined, WordPress Button renders as a button element, not a link
			const viewButton = await screen.findByRole( 'button', { name: 'View site' } );
			expect( viewButton ).toBeVisible();
		} );
	} );

	describe( 'Upsell Display Logic', () => {
		test( 'shows upsell when no custom domain exists and plan is free', async () => {
			const mockSite = createMockSite( { plan: { is_free: true } as any } );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// Upsell button should appear for free plan without custom domain
			await screen.findByRole( 'link', { name: 'Get your domain' } );
			expect( screen.getByRole( 'link', { name: 'Get your domain' } ) ).toHaveAttribute(
				'href',
				expect.stringContaining( '/domains/add/' )
			);
		} );

		test( 'does not show upsell when custom domain exists', async () => {
			const mockSite = createMockSite( { plan: { is_free: true } as any } );
			const customDomain = createMockDomain( 'example.com', true );

			nock.cleanAll();
			mockDomainsApi( [ customDomain ] );
			render( <SiteLaunchCelebrationModal site={ mockSite } onClose={ jest.fn() } /> );

			// Wait for the domain to appear, confirming the API response is loaded
			await screen.findByText( 'example.com' );

			// Upsell button should NOT appear when custom domain is present
			expect( screen.queryByRole( 'link', { name: 'Get your domain' } ) ).not.toBeInTheDocument();
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
