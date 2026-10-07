/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AgencySitePlanCard from '../plan-card';
import type { AgencySite, Site } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 1;

const pressableAgencySite = {
	blog_id: 123,
	url: 'example.com',
	hosting_provider_guess: 'pressable',
} as AgencySite;

const site = {
	ID: 123,
	slug: 'example.com',
	jetpack_connection: true,
	is_wpcom_atomic: false,
	plan: { product_slug: 'jetpack_free', product_name_short: 'Jetpack Free' },
} as Site;

const signature4 = {
	name: 'Pressable Signature 4',
	slug: 'pressable-signature-4',
	product_id: 104,
	metadata: { category: 'signature', sites: 10, visits: 100000, storage: 50, php_worker_count: 5 },
};

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [
			{
				id: AGENCY_ID,
				user: { capabilities: [ 'a4a_read_marketplace' ] },
				third_party: {
					pressable: {
						pressable_id: 1,
						a4a_id: String( AGENCY_ID ),
						usage: { sites_count: 3, visits_count: 20000, storage_gb: 10 },
					},
				},
			},
		] );

	nock( API )
		.get( '/wpcom/v2/agency/products' )
		.query( true )
		.reply( 200, [ { slug: 'pressable-hosting', products: [ signature4 ] } ] );
}

function mockLicenses( items: unknown[] ) {
	nock( API )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items, total_pages: 1 } );
}

function mockSitePlanQueries() {
	nock( API )
		.get( `/rest/v1.4/sites/${ site.ID }/plans` )
		.query( true )
		.reply( 200, {
			plans: {
				1: {
					product_id: 1,
					product_slug: 'jetpack_free',
					product_name_short: 'Jetpack Free',
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

	nock( API ).get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
}

describe( '<AgencySitePlanCard>', () => {
	test( 'shows the agency’s Pressable plan and shared usage on a Pressable site', async () => {
		mockAgency();
		mockLicenses( [
			{
				license_key: 'pressable-signature-4_abc',
				product_id: signature4.product_id,
				referral: null,
				revoked_at: null,
				quantity: null,
			},
		] );

		render( <AgencySitePlanCard agencySite={ pressableAgencySite } site={ site } /> );

		const planLink = await screen.findByRole( 'link', { name: /Pressable Signature 4/ } );
		expect( planLink ).toHaveAttribute( 'href', '/hosting/pressable' );
		expect(
			screen.getByText( 'Storage and visits are shared across 3 sites in your plan.' )
		).toBeVisible();
		expect( screen.getByText( 'Visits this month' ) ).toBeVisible();
		expect( screen.getByText( '10GB' ) ).toBeVisible();
	} );

	test( 'falls back to the Jetpack card when the agency has no Pressable plan', async () => {
		mockAgency();
		mockLicenses( [] );
		mockSitePlanQueries();

		render( <AgencySitePlanCard agencySite={ pressableAgencySite } site={ site } /> );

		expect( await screen.findByText( 'Jetpack Free' ) ).toBeVisible();
		expect( screen.queryByText( /Pressable Signature/ ) ).not.toBeInTheDocument();
	} );
} );
