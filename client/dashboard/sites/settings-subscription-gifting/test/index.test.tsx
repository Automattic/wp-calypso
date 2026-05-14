/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SubscriptionGiftingSettings from '../index';
import type { Site, SiteSettings } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
} as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockSettings( settings: SiteSettings ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.4/sites/${ site.ID }/settings` )
		.query( true )
		.reply( 200, { settings } );
}

describe( '<SubscriptionGiftingSettings>', () => {
	test( 'renders the save form for an unflagged site', async () => {
		mockSite( site );
		mockSettings( { wpcom_gifting_subscription: false } );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } );

		expect(
			screen.getByRole( 'checkbox', {
				name: /Allow site visitors to gift your plan/,
			} )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeVisible();
	} );

	test( 'shows unavailability notice for a flagged site', async () => {
		mockSite( site );
		mockSettings( { wpcom_gifting_subscription: false, flag: 'mature' } );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } );

		expect(
			screen.getByText(
				'Gift subscriptions are not available for this site because it has been flagged for content review.'
			)
		).toBeVisible();
		expect(
			screen.queryByRole( 'checkbox', { name: /Allow site visitors to gift your plan/ } )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );
} );
