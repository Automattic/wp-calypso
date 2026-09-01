/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { useLaunchSitePlugin } from '../plugin-launch-site';
import type { DomainSummary, Site } from '@automattic/api-core';

const createMockSite = ( options: Partial< Site > = {} ): Site =>
	( {
		ID: 1,
		slug: 'kaonashi.wordpress.com',
		URL: 'https://kaonashi.wordpress.com',
		name: 'Kaonashi',
		launch_status: 'unlaunched' as const,
		is_a4a_dev_site: false,
		capabilities: { manage_options: true },
		plan: {
			product_slug: 'business-bundle',
			product_name: 'Business plan',
			is_free: false,
		},
		...options,
	} ) as Site;

const createMockDomain = ( domain: string, hasSubscription = true ): DomainSummary =>
	( {
		domain,
		blog_id: 1,
		subscription_id: hasSubscription ? 123 : null,
	} ) as unknown as DomainSummary;

const mockDomainsApi = ( domains: DomainSummary[] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
};

function LaunchHarness( { site }: { site: Site } ) {
	const { node, panel } = useLaunchSitePlugin( { site } );
	return (
		<>
			{ node && (
				<button onClick={ node.onClick } disabled={ node.disabled }>
					{ node.title }
				</button>
			) }
			{ node?.href && (
				<a href={ node.href } data-testid="launch-href">
					launch link
				</a>
			) }
			{ panel }
		</>
	);
}

describe( 'useLaunchSitePlugin', () => {
	afterEach( () => nock.cleanAll() );

	test( 'renders the pre-launch modal panel when a paid, custom-domain site is launched from the omnibar', async () => {
		const user = userEvent.setup();
		mockDomainsApi( [
			createMockDomain( 'kaonashi.wordpress.com', false ),
			createMockDomain( 'kaonashi.com' ),
		] );

		render( <LaunchHarness site={ createMockSite() } /> );

		const launchButton = await screen.findByRole( 'button', { name: 'Launch site' } );
		// The button is disabled until the domains query settles, which is what
		// tells the hook the site has a custom domain and should open the modal.
		await waitFor( () => expect( launchButton ).toBeEnabled() );
		await user.click( launchButton );

		expect(
			await screen.findByRole( 'dialog', { name: 'Launching makes your site public' } )
		).toBeVisible();
	} );

	test( 'sends Back to the page the launch started from, not the site overview', async () => {
		const settingsPath = '/sites/kaonashi.wordpress.com/settings/site-visibility';
		window.history.replaceState( {}, '', settingsPath );
		mockDomainsApi( [ createMockDomain( 'kaonashi.wordpress.com', false ) ] );

		render( <LaunchHarness site={ createMockSite() } /> );

		const link = await screen.findByTestId( 'launch-href' );
		const params = new URL( link.getAttribute( 'href' ) as string, window.location.origin )
			.searchParams;

		// Back returns to the settings screen the omnibar was clicked from…
		expect( params.get( 'back_to' ) ).toContain( settingsPath );
		// …while the post-launch landing stays on the site overview.
		expect( params.get( 'redirect_to' ) ).toContain( '/sites/kaonashi.wordpress.com' );
		expect( params.get( 'redirect_to' ) ).not.toContain( '/settings/site-visibility' );
	} );
} );
