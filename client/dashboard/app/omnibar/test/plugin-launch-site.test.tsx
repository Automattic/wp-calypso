/**
 * @jest-environment jsdom
 */

import { buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { useLaunchSiteNodeBuilder } from '../plugin-launch-site';
import type { DomainSummary, Site } from '@automattic/api-core';
import type { AdminBarNode } from '@automattic/omnibar';

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

const LAUNCH_SITE_NODE: AdminBarNode = {
	id: 'launch-site',
	title: '<span class="ab-icon"><svg></svg></span><span class="ab-label">Luncurkan situs</span>',
	parent: false,
	href: 'https://wordpress.com/start/launch-site?siteSlug=kaonashi.wordpress.com',
	group: false,
};

const NEW_CONTENT_NODE: AdminBarNode = {
	id: 'new-content',
	title: 'New',
	parent: false,
	href: 'https://kaonashi.wordpress.com/wp-admin/post-new.php',
	group: false,
};

function LaunchHarness( {
	site,
	adminBarNodes = [ LAUNCH_SITE_NODE, NEW_CONTENT_NODE ],
}: {
	site: Site;
	adminBarNodes?: AdminBarNode[];
} ) {
	const { nodeBuilder, panel } = useLaunchSiteNodeBuilder( { site } );
	const { siteActions = [] } = buildOmnibarNodesFromAdminBarNodes( adminBarNodes, {
		'launch-site': nodeBuilder,
	} );
	return (
		<>
			{ siteActions.map( ( node ) => (
				<button key={ node.id } onClick={ node.onClick } disabled={ node.disabled }>
					{ node.title }
				</button>
			) ) }
			{ panel }
		</>
	);
}

describe( 'useLaunchSiteNodeBuilder', () => {
	// The site is in the "Publish" copy experiment. ExPlat reads a cached assignment from
	// localStorage before asking the server, so this pins the control (today's copy).
	beforeEach( () =>
		window.localStorage.setItem(
			'explat-experiment--calypso_site_launch_publish_copy_202610_v1',
			JSON.stringify( {
				experimentName: 'calypso_site_launch_publish_copy_202610_v1',
				variationName: 'control',
				retrievedTimestamp: Date.now(),
				ttl: 3600,
			} )
		)
	);

	afterEach( () => {
		nock.cleanAll();
		window.localStorage.clear();
	} );

	test( 'renders the pre-launch modal panel when a paid, custom-domain site is launched from the omnibar', async () => {
		const user = userEvent.setup();
		mockDomainsApi( [
			createMockDomain( 'kaonashi.wordpress.com', false ),
			createMockDomain( 'kaonashi.com' ),
		] );

		render( <LaunchHarness site={ createMockSite() } /> );

		const launchButton = await screen.findByRole( 'button', { name: 'Luncurkan situs' } );
		// The button is disabled until the domains query settles, which is what
		// tells the hook the site has a custom domain and should open the modal.
		await waitFor( () => expect( launchButton ).toBeEnabled() );
		await user.click( launchButton );

		expect(
			await screen.findByRole( 'dialog', { name: 'Launching makes your site public' } )
		).toBeVisible();
	} );

	test( 'takes the title and position from the admin bar', async () => {
		mockDomainsApi( [] );

		render(
			<LaunchHarness
				site={ createMockSite() }
				adminBarNodes={ [ NEW_CONTENT_NODE, LAUNCH_SITE_NODE ] }
			/>
		);

		await screen.findByRole( 'button', { name: 'Luncurkan situs' } );
		expect( screen.getAllByRole( 'button' ).map( ( button ) => button.textContent ) ).toEqual( [
			'New',
			'Luncurkan situs',
		] );
	} );

	test( 'hides the admin bar node when the dashboard does not consider the site launchable', () => {
		render( <LaunchHarness site={ createMockSite( { launch_status: 'launched' } ) } /> );

		expect( screen.getAllByRole( 'button' ).map( ( button ) => button.textContent ) ).toEqual( [
			'New',
		] );
	} );
} );
