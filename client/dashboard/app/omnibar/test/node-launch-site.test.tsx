/**
 * @jest-environment jsdom
 */

import { omnibarSiteIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { shoppingCartManagerClient } from '../../shopping-cart';
import OmnibarContainer from '../omnibar';

const site = {
	ID: 1,
	name: 'Test Site',
	launch_status: 'unlaunched',
	site_migration: {},
	capabilities: { manage_options: true },
	plan: { is_free: false },
};

const launchSiteNode = {
	id: 'launch-site',
	title: '<span class="ab-icon"><svg></svg></span><span class="ab-label">Launch site</span>',
	parent: null,
	href: 'https://wordpress.com/setup/launch-site?siteSlug=test-site.wordpress.com&ref=wp-admin',
	group: null,
};

function mockSite( mockedSite: object ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockDomains( domains: object[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
}

function renderOmnibar() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarSiteIdQuery().queryKey, site.ID );

	return render( <OmnibarContainer cartManagerClient={ shoppingCartManagerClient } />, {
		queryClient,
	} );
}

describe( '<Omnibar> launch site node', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/dashboard/admin-bar' )
			.query( true )
			.reply( 200, { nodes: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/admin-bar` )
			.query( true )
			.reply( 200, { nodes: [ launchSiteNode ] } );
	} );

	afterEach( () => nock.cleanAll() );

	test( 'shows the node', async () => {
		mockSite( site );
		mockDomains( [] );

		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const launchNode = await within( toolbar ).findByRole( 'button', { name: 'Launch site' } );
		expect( within( launchNode ).getByText( 'Launch site' ) ).toBeVisible();
	} );

	test( 'opens the pre-launch modal when clicking the node for a paid site with a custom domain', async () => {
		const user = userEvent.setup();
		mockSite( site );
		mockDomains( [
			{ domain: 'test-site.wordpress.com', blog_id: site.ID, subscription_id: null },
			{ domain: 'test-site.com', blog_id: site.ID, subscription_id: 123 },
		] );

		renderOmnibar();

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
