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
		product_slug: 'value_bundle',
		product_name_short: 'Personal',
		is_free: false,
		features: {
			active: [ 'subscription-gifting' ],
		},
	},
} as Site;

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

describe( '<SubscriptionGiftingSettings>', () => {
	test( 'renders the settings form when gifting is not blocked', async () => {
		mockSite( site );
		mockSettings( {
			wpcom_gifting_subscription: true,
			wpcom_gifting_subscription_blocked: false,
		} );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await waitFor( () => {
			expect(
				screen.getByRole( 'heading', { name: 'Accept a gift subscription' } )
			).toBeVisible();
		} );

		expect(
			screen.getByRole( 'checkbox', {
				name: 'Allow site visitors to gift your plan and domain renewal costs',
			} )
		).toBeVisible();

		expect(
			screen.queryByText( /Gift subscriptions are not available/ )
		).not.toBeInTheDocument();
	} );

	test( 'shows the unavailability notice when the site is blocked from receiving gifts', async () => {
		mockSite( site );
		mockSettings( {
			wpcom_gifting_subscription: false,
			wpcom_gifting_subscription_blocked: true,
		} );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await waitFor( () => {
			expect(
				screen.getByText( /Gift subscriptions are not available for this site/ )
			).toBeVisible();
		} );

		expect(
			screen.queryByRole( 'checkbox', {
				name: 'Allow site visitors to gift your plan and domain renewal costs',
			} )
		).not.toBeInTheDocument();
	} );
} );
