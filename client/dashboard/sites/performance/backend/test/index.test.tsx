/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SitePerformanceBackend from '../index';
import type { Site } from '@automattic/api-core';

const siteSlug = 'test-site.wordpress.com';

const businessSite = {
	ID: 1,
	slug: siteSlug,
	is_wpcom_atomic: true,
	plan: {
		product_slug: 'business-bundle',
		product_name_short: 'Business',
		is_free: false,
		features: {
			active: [ 'atomic' ],
		},
	},
} as Site;

const personalSite = {
	ID: 1,
	slug: siteSlug,
	is_wpcom_atomic: false,
	plan: {
		product_slug: 'personal-bundle',
		product_name_short: 'Personal',
		is_free: false,
		features: {
			active: [],
		},
	},
} as unknown as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

describe( '<SitePerformanceBackend>', () => {
	test( 'renders placeholder for a site on the Business plan', async () => {
		mockSite( businessSite );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect(
			await screen.findByText( 'Application Performance Monitoring — coming soon.' )
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Upgrade plan' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders upsell when the site is on a plan below Business', async () => {
		mockSite( personalSite );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect( await screen.findByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
		expect(
			screen.queryByText( 'Application Performance Monitoring — coming soon.' )
		).not.toBeInTheDocument();
	} );
} );
