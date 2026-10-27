/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { withPressablePlan } from '../plan-field';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const API = 'https://public-api.wordpress.com';

const signature4 = {
	name: 'Pressable Signature 4',
	slug: 'pressable-signature-4',
	product_id: 104,
	metadata: { category: 'signature', sites: 10, visits: 100000, storage: 50, php_worker_count: 5 },
};

const signature4License = {
	license_key: 'pressable-signature-4_abc',
	product_id: signature4.product_id,
	referral: null,
	revoked_at: null,
	quantity: null,
};

const renderSharedPlan = jest.fn( () => <span>Jetpack Complete</span> );

const sharedPlanField: Field< AgencySite > = {
	id: 'plan',
	label: 'Plan',
	render: renderSharedPlan,
};

function mockAgency( licenses: unknown[], { productsDelay = 0 } = {} ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 1 } ] );
	nock( API )
		.get( '/wpcom/v2/agency/products' )
		.query( true )
		.delay( productsDelay )
		.reply( 200, [ { slug: 'pressable-hosting', products: [ signature4 ] } ] );
	nock( API )
		.get( '/wpcom/v2/jetpack-licensing/licenses' )
		.query( true )
		.reply( 200, { items: licenses, total_pages: 1 } );
}

function renderPlanCell( item: AgencySite ) {
	const PlanCell = withPressablePlan( sharedPlanField )!.render!;
	return render( <PlanCell item={ item } field={ {} as never } /> );
}

describe( 'withPressablePlan', () => {
	test( 'shows the agency’s Pressable plan for a Pressable site', async () => {
		mockAgency( [ signature4License ] );

		renderPlanCell( { blog_id: 1, hosting_provider_guess: 'pressable' } as AgencySite );

		expect( await screen.findByText( 'Pressable Signature 4' ) ).toBeVisible();
		expect( screen.queryByText( 'Jetpack Complete' ) ).not.toBeInTheDocument();
	} );

	test( 'does not show the site’s own plan while the plan catalog loads', async () => {
		renderSharedPlan.mockClear();
		mockAgency( [ signature4License ], { productsDelay: 200 } );

		renderPlanCell( { blog_id: 1, hosting_provider_guess: 'pressable' } as AgencySite );

		expect( await screen.findByText( 'Pressable Signature 4' ) ).toBeVisible();
		expect( renderSharedPlan ).not.toHaveBeenCalled();
	} );

	test( 'keeps the site’s own plan when the agency has no Pressable plan', async () => {
		mockAgency( [] );

		renderPlanCell( { blog_id: 1, hosting_provider_guess: 'pressable' } as AgencySite );

		expect( await screen.findByText( 'Jetpack Complete' ) ).toBeVisible();
	} );

	test( 'keeps the site’s own plan for other hosts', () => {
		renderPlanCell( { blog_id: 1, hosting_provider_guess: 'unknown' } as AgencySite );

		expect( screen.getByText( 'Jetpack Complete' ) ).toBeVisible();
	} );
} );
