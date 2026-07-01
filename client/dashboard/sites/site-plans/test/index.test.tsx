/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SitePlans from '../index';
import type { Site, User } from '@automattic/api-core';

jest.mock( '../../../app/router/sites', () => {
	const actual = jest.requireActual( '../../../app/router/sites' );
	return {
		...actual,
		siteRoute: {
			useParams: () => ( { siteSlug: 'test-site.wordpress.com' } ),
			fullPath: '/sites/$siteSlug',
		},
	};
} );

const SITE_ID = 1;
const OWNER_USER_ID = 10;
const NON_OWNER_USER_ID = 99;

const site = {
	ID: SITE_ID,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	site_owner: OWNER_USER_ID,
	plan: {
		product_slug: 'free_plan',
		product_name_short: 'Free',
		is_free: true,
		features: { active: [] },
	},
} as unknown as Site;

const ownerUser = {
	ID: OWNER_USER_ID,
	username: 'owner',
	email: 'owner@example.com',
	language: 'en',
} as User;

const nonOwnerUser = {
	ID: NON_OWNER_USER_ID,
	username: 'non-owner',
	email: 'nonowner@example.com',
	language: 'en',
} as User;

const freePlan = {
	product_id: 1,
	product_slug: 'free_plan',
	product_name: 'Free',
	plan_card_name: 'Free',
	plan_card_order: 0,
	product_tier_id: 1,
	product_tier_product_ids: [ 1 ],
	interval: 365,
	current_plan: true,
	raw_price: 0,
	raw_price_integer: 0,
	raw_discount: 0,
	raw_discount_integer: 0,
	formatted_price: '$0',
	formatted_original_price: '$0',
	formatted_discount: '$0',
	currency_code: 'USD',
	original_price: { amount: 0, currency: 'USD' },
	discount_reason: null,
	cost_overrides: [],
	is_domain_upgrade: false,
};

const personalPlan = {
	product_id: 2,
	product_slug: 'personal-bundle',
	product_name: 'Personal',
	plan_card_name: 'Personal',
	plan_card_order: 1,
	product_tier_id: 2,
	product_tier_product_ids: [ 2 ],
	interval: 365,
	current_plan: false,
	raw_price: 4,
	raw_price_integer: 400,
	raw_discount: 0,
	raw_discount_integer: 0,
	formatted_price: '$4',
	formatted_original_price: '$4',
	formatted_discount: '$0',
	currency_code: 'USD',
	original_price: { amount: 4, currency: 'USD' },
	discount_reason: null,
	cost_overrides: [],
	is_domain_upgrade: false,
};

function mockApis() {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );

	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.4/sites/${ SITE_ID }/plans` )
		.query( true )
		.reply( 200, {
			plans: {
				1: freePlan,
				2: personalPlan,
			},
		} );
}

describe( '<SitePlans>', () => {
	beforeEach( () => {
		mockApis();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'shows upgrade button for site owner', async () => {
		render( <SitePlans />, { user: ownerUser } );

		await screen.findByText( 'Personal' );

		expect( screen.getByRole( 'link', { name: 'Get Personal' } ) ).toBeVisible();
	} );

	test( 'hides upgrade button for non-owner', async () => {
		render( <SitePlans />, { user: nonOwnerUser } );

		await screen.findByText( 'Personal' );

		expect( screen.queryByRole( 'link', { name: 'Get Personal' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows "Your plan" indicator for current plan regardless of ownership', async () => {
		render( <SitePlans />, { user: nonOwnerUser } );

		await screen.findByText( 'Personal' );

		expect( screen.getByRole( 'button', { name: 'Your plan' } ) ).toBeVisible();
	} );
} );
