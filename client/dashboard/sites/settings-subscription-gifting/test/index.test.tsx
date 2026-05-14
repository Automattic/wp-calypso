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
	plan: {
		product_slug: 'business-bundle',
		product_name_short: 'Business',
		is_free: false,
		features: { active: [ 'subscription-gifting' ] },
	},
} as unknown as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockSettings( settings: Partial< SiteSettings > ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.4/sites/${ site.ID }/settings` )
		.query( true )
		.reply( 200, { settings } );
}

function mockWordadsStatus( unsafe: false | 'mature' | 'private' | 'spam' | 'other' ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/wordads/account` )
		.query( true )
		.reply( 200, { unsafe, active: false, approved: false } );
}

describe( '<SubscriptionGiftingSettings>', () => {
	test( 'renders the settings form for a normal site', async () => {
		mockSite( site );
		mockSettings( { wpcom_gifting_subscription: false } );
		mockWordadsStatus( false );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } );

		expect(
			screen.getByRole( 'checkbox', {
				name: 'Allow site visitors to gift your plan and domain renewal costs',
			} )
		).toBeVisible();
		expect( screen.queryByRole( 'img', { name: /mature content/i } ) ).not.toBeInTheDocument();
	} );

	test( 'shows unavailability notice on a mature/brown-flagged site', async () => {
		mockSite( site );
		mockSettings( { wpcom_gifting_subscription: false } );
		mockWordadsStatus( 'mature' );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } );

		await waitFor( () => {
			expect(
				screen.getByText(
					'Gift subscriptions are unavailable for this site because it has been identified as containing mature content.'
				)
			).toBeVisible();
		} );
	} );

	test( 'does not show unavailability notice on a non-mature site', async () => {
		mockSite( site );
		mockSettings( { wpcom_gifting_subscription: false } );
		mockWordadsStatus( false );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } );

		expect(
			screen.queryByText(
				'Gift subscriptions are unavailable for this site because it has been identified as containing mature content.'
			)
		).not.toBeInTheDocument();
	} );
} );
