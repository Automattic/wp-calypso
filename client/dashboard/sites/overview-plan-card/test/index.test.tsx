/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://my.a4a.localhost/"}
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import PlanCard from '../index';
import type { AppConfig } from '../../../app/context';
import type { Site } from '@automattic/api-core';

const PURCHASE_ID = 456;

const site = {
	ID: 123,
	slug: 'example.com',
	is_wpcom_atomic: true,
	jetpack_connection: true,
	plan: { product_slug: 'business-bundle', product_name_short: 'Business' },
} as Site;

const withoutBillingRoutes: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, me: false },
};

describe( '<PlanCard>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.4/sites/${ site.ID }/plans` )
			.query( true )
			.reply( 200, {
				plans: {
					1: {
						id: PURCHASE_ID,
						product_id: 1,
						product_slug: 'business-bundle',
						product_name_short: 'Business',
						current_plan: true,
						original_price: { amount: 0 },
						raw_price: 0,
						raw_price_integer: 0,
						raw_discount: 0,
						raw_discount_integer: 0,
						cost_overrides: [],
					},
				},
			} );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/upgrades' )
			.query( { site: site.ID } )
			.reply( 200, [
				{
					ID: String( PURCHASE_ID ),
					blog_id: String( site.ID ),
					product_slug: 'business-bundle',
					expiry_date: '2099-01-01T00:00:00+00:00',
					expiry_status: 'auto-renewing',
				},
			] );

		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
			.query( true )
			.reply( 200, { max_storage_bytes: 1073741824, storage_used_bytes: 100000000 } );

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/hosting/metrics` )
			.query( true )
			.reply( 200, { data: { periods: {} } } );
	} );

	test( 'links the plan and purchases to WordPress.com when the app has no billing routes', async () => {
		render( <PlanCard site={ site } />, { config: withoutBillingRoutes } );

		expect( await screen.findByRole( 'link', { name: /Business/ } ) ).toHaveAttribute(
			'href',
			expect.stringMatching(
				new RegExp( `/purchases/subscriptions/example\\.com/${ PURCHASE_ID }$` )
			)
		);
		expect( await screen.findByRole( 'link', { name: 'See all purchases' } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/purchases\/subscriptions\/example\.com$/ )
		);
	} );
} );
