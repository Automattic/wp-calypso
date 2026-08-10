/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { SiteLaunchButton } from '../index';
import type { DomainSummary, Site } from '@automattic/api-core';

const createMockSite = ( options: Partial< Site > = {} ): Site =>
	( {
		ID: 1,
		slug: 'kaonashi.wordpress.com',
		URL: 'https://kaonashi.wordpress.com',
		name: 'Kaonashi',
		launch_status: 'unlaunched' as const,
		is_a4a_dev_site: false,
		is_wpcom_staging_site: false,
		plan: {
			product_slug: 'business-bundle',
			product_name: 'Business plan',
			product_name_short: 'Business',
			is_free: false,
		},
		...options,
	} ) as Site;

const createMockDomain = ( domain: string ): DomainSummary =>
	( { domain, blog_id: 1, subscription_id: 123 } ) as unknown as DomainSummary;

const mockDomainsApi = ( domains: DomainSummary[] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
};

describe( '<SiteLaunchButton>', () => {
	beforeEach( () => {
		mockDomainsApi( [ createMockDomain( 'kaonashi.com' ), createMockDomain( 'kaonashi.blog' ) ] );
	} );

	test( 'shows a pre-launch confirmation instead of launching immediately for plan+domain sites', async () => {
		const user = userEvent.setup();
		render( <SiteLaunchButton site={ createMockSite() } tracksContext="test" /> );

		await user.click( await screen.findByRole( 'button', { name: 'Launch your site' } ) );

		expect(
			await screen.findByRole( 'dialog', { name: 'Launching makes your site public.' } )
		).toBeVisible();
	} );

	test( 'launches the site after the user confirms', async () => {
		const launchScope = nock( 'https://public-api.wordpress.com' )
			.post( /\/sites\/1\/launch/ )
			.reply( 200, {} );
		const user = userEvent.setup();
		render( <SiteLaunchButton site={ createMockSite() } tracksContext="test" /> );

		await user.click( await screen.findByRole( 'button', { name: 'Launch your site' } ) );
		await user.click( await screen.findByRole( 'button', { name: 'Yes, launch site!' } ) );

		await waitFor( () => expect( launchScope.isDone() ).toBe( true ) );
	} );
} );
