/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { SiteLaunchButton } from '..';
import { render } from '../../../test-utils';
import type { DomainSummary, Site } from '@automattic/api-core';

const createMockSite = ( options: Partial< Site > = {} ): Site =>
	( {
		ID: 1,
		slug: 'kaonashi.wordpress.com',
		URL: 'https://kaonashi.wordpress.com',
		name: 'Kaonashi',
		launch_status: 'unlaunched' as const,
		plan: {
			product_slug: 'business-bundle',
			product_name: 'Business plan',
			product_name_short: 'Business',
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

const mockDomainsApi = ( domains: DomainSummary[] = [] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
};

const mockLaunchApi = () =>
	nock( 'https://public-api.wordpress.com' )
		.post( /\/sites\/1\/launch$/ )
		.reply( 200, {} );

describe( '<SiteLaunchButton>', () => {
	test( 'opens the pre-launch modal instead of launching immediately for a paid site with a custom domain', async () => {
		const user = userEvent.setup();
		mockDomainsApi( [
			createMockDomain( 'kaonashi.wordpress.com', false ),
			createMockDomain( 'kaonashi.com' ),
		] );
		const launchScope = mockLaunchApi();

		render( <SiteLaunchButton site={ createMockSite() } tracksContext="test" /> );

		await user.click( await screen.findByRole( 'button', { name: 'Launch your site' } ) );

		expect(
			await screen.findByRole( 'dialog', { name: 'Launching makes your site public' } )
		).toBeVisible();
		expect( launchScope.isDone() ).toBe( false );
	} );

	test( 'launches the site when the pre-launch modal is confirmed', async () => {
		const user = userEvent.setup();
		mockDomainsApi( [
			createMockDomain( 'kaonashi.wordpress.com', false ),
			createMockDomain( 'kaonashi.com' ),
		] );
		const launchScope = mockLaunchApi();

		render( <SiteLaunchButton site={ createMockSite() } tracksContext="test" /> );

		await user.click( await screen.findByRole( 'button', { name: 'Launch your site' } ) );
		await user.click( await screen.findByRole( 'button', { name: 'Yes, launch site!' } ) );

		await waitFor( () => expect( launchScope.isDone() ).toBe( true ) );
	} );

	test( 'does not open the modal and launches immediately for a hosting-trial site', async () => {
		const user = userEvent.setup();
		mockDomainsApi( [ createMockDomain( 'kaonashi.wordpress.com', false ) ] );
		const launchScope = mockLaunchApi();

		render(
			<SiteLaunchButton
				site={ createMockSite( {
					plan: {
						product_slug: 'wp_bundle_hosting_trial_monthly',
						product_name: 'Hosting Trial',
						is_free: false,
					},
				} as Partial< Site > ) }
				tracksContext="test"
			/>
		);

		await user.click( await screen.findByRole( 'button', { name: 'Launch your site' } ) );

		await waitFor( () => expect( launchScope.isDone() ).toBe( true ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'renders a link to the launch flow for a free site without an immediate launch', async () => {
		mockDomainsApi( [ createMockDomain( 'kaonashi.wordpress.com', false ) ] );

		render(
			<SiteLaunchButton
				site={ createMockSite( {
					plan: {
						product_slug: 'free_plan',
						product_name: 'Free',
						is_free: true,
					},
				} as Partial< Site > ) }
				tracksContext="test"
			/>
		);

		const launchLink = await screen.findByRole( 'link', { name: 'Launch your site' } );
		expect( launchLink ).toHaveAttribute( 'href', expect.stringContaining( '/start/launch-site' ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
