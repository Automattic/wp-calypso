/**
 * @vitest-environment jsdom
 * @vitest-environment-options {"url": "http://my.a4a.localhost/"}
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../../../app/context';
import { render } from '../../../../../test-utils';
import PlanCard from '../index';
import type { AppConfig } from '../../../../../app/context';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 123,
	slug: 'example.com',
	is_wpcom_atomic: true,
	plan: { product_slug: 'business-bundle', product_name_short: 'Business' },
} as unknown as Site;

describe( '<PlanCard>', () => {
	test( 'links the plan and purchases to WordPress.com when the app has no billing routes', async () => {
		const withoutBillingRoutes: AppConfig = {
			...APP_CONTEXT_DEFAULT_CONFIG,
			supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, me: false },
		};
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.4/sites/${ site.ID }/plans` )
			.query( true )
			.reply( 200, {
				plans: {
					1: { id: 456, current_plan: true, original_price: { amount: 0 }, cost_overrides: [] },
				},
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/upgrades' )
			.query( { site: site.ID } )
			.reply( 200, [ { ID: '456' } ] );

		render( <PlanCard site={ site } />, { config: withoutBillingRoutes } );

		const planLink = await screen.findByRole( 'link', { name: /Business/ } );
		const purchasesLink = await screen.findByRole( 'link', { name: /See all purchases/ } );

		expect( planLink ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/purchases\/subscriptions\/example\.com\/456$/ )
		);
		expect( purchasesLink ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/purchases\/subscriptions\/example\.com$/ )
		);
		expect( purchasesLink ).toHaveAttribute( 'target', '_blank' );
	} );

	test( 'shows a preview site the date it is deleted and a link to keep it', async () => {
		const preview = {
			...site,
			slug: 'test.wpcomstaging.com',
			plan: { is_free: true },
		} as Site;
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/wow-funnel/pending' )
			.query( true )
			.reply( 200, {
				preview_sites: [
					{
						blog_id: preview.ID,
						site_slug: preview.slug,
						expires_at: Date.UTC( 2026, 11, 16, 12 ) / 1000,
					},
				],
			} );

		render( <PlanCard site={ preview } /> );

		const deletionDate = await screen.findByText( /deleted on December 16, 2026/ );

		expect( deletionDate ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Preview/ } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/setup/launch-site' )
		);
	} );

	test( 'shows the storage as unavailable when the user cannot read media storage', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ site.ID }/media-storage` )
			.query( true )
			.reply( 403, { error: 'unauthorized', message: 'User cannot view media storage limits' } );

		render( <PlanCard site={ site } /> );

		expect( await screen.findByText( 'Information unavailable' ) ).toBeVisible();
	} );
} );
