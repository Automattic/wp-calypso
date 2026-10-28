/**
 * @jest-environment jsdom
 */

import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { useLaunchSiteNodeBuilder } from '../index';
import type { Site } from '@automattic/api-core';
import type { AdminBarNode } from '@automattic/omnibar';

const site = {
	ID: 1,
	name: 'Test Site',
	launch_status: 'unlaunched',
	site_migration: {},
	capabilities: { manage_options: true },
	plan: { is_free: false },
} as unknown as Site;

const launchSiteNode = {
	id: 'launch-site',
	title: '<span class="ab-icon"><svg></svg></span><span class="ab-label">Launch site</span>',
	parent: false,
	href: 'https://wordpress.com/setup/launch-site?siteSlug=test-site.wordpress.com&ref=wp-admin',
	group: false,
} as AdminBarNode;

function mockDomains( domains: object[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
}

function LaunchSiteNodeOmnibar() {
	const { nodeBuilder, panel } = useLaunchSiteNodeBuilder( { site } );
	const { siteNodes } = buildOmnibarNodesFromAdminBarNodes( [ launchSiteNode ], {
		'launch-site': nodeBuilder,
	} );
	return (
		<>
			<Omnibar nodes={ { site: { id: 'site-name', title: site.name }, siteNodes } } />
			{ panel }
		</>
	);
}

describe( '<Omnibar> launch site node', () => {
	test( 'shows the node', async () => {
		mockDomains( [] );

		render( <LaunchSiteNodeOmnibar /> );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const launchNode = await within( toolbar ).findByRole( 'button', { name: 'Launch site' } );
		expect( within( launchNode ).getByText( 'Launch site' ) ).toBeVisible();
	} );

	test( 'opens the pre-launch modal when clicking the node for a paid site with a custom domain', async () => {
		const user = userEvent.setup();
		mockDomains( [
			{ domain: 'test-site.wordpress.com', blog_id: site.ID, subscription_id: null },
			{ domain: 'test-site.com', blog_id: site.ID, subscription_id: 123 },
		] );

		render( <LaunchSiteNodeOmnibar /> );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const launchButton = await within( toolbar ).findByRole( 'button', {
			name: 'Launch site',
		} );
		// The button stays disabled until the domains query settles, which is what
		// tells the launch flow the site has a custom domain and needs the modal.
		await waitFor( () => expect( launchButton ).toBeEnabled() );
		await user.click( launchButton );

		expect(
			await screen.findByRole( 'dialog', { name: 'Launching makes your site public' } )
		).toBeVisible();
	} );
} );
