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

describe( '<AgencySitePlanCard>', () => {
	test( 'shows the agency’s Pressable plan on a Pressable site', async () => {
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
	} );
} );
