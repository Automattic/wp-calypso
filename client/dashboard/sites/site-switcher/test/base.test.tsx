/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { SiteSwitcherBase } from '../base';
import type { Site } from '@automattic/api-core';

const currentSite = {
	ID: 1,
	name: 'My Site',
	slug: 'my-site.wordpress.com',
	URL: 'https://my-site.wordpress.com',
	capabilities: { manage_options: true },
} as Site;

const otherSite = {
	ID: 2,
	name: 'Other Site',
	slug: 'other-site.wordpress.com',
	URL: 'https://other-site.wordpress.com',
	capabilities: { manage_options: true },
} as Site;

describe( '<SiteSwitcherBase>', () => {
	test( 'records calypso_dashboard_site_switcher_site_url_click when clicking a site URL', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/sites' )
			.query( true )
			.reply( 200, { sites: [ currentSite, otherSite ] } );

		const user = userEvent.setup();
		const { recordTracksEvent } = render( <SiteSwitcherBase site={ currentSite } /> );

		// Open the site switcher dropdown.
		const toggleButton = screen.getByRole( 'button' );
		await user.click( toggleButton );

		// Wait for site list to load and find the other site's URL link.
		const siteUrlLink = await screen.findByRole( 'link', { name: /other-site\.wordpress\.com/ } );
		await user.click( siteUrlLink );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_site_switcher_site_url_click'
		);
	} );
} );
