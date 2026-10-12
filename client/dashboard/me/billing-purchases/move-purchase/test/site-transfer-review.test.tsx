/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { SiteTransferReview } from '../site-transfer-review';
import type { Purchase, Site, SiteTransferPreview } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

const purchase = {
	ID: 10,
	user_id: 1,
	blog_id: 100,
	site_slug: 'wrong.wordpress.com',
	product_name: 'Business',
	product_slug: 'business-bundle',
	is_plan: true,
	is_jetpack_plan_or_product: false,
	included_domain: 'bundled.com',
	subscription_status: 'active',
	expiry_status: 'auto-renewing',
} as Purchase;

const targetSite = {
	ID: 200,
	name: 'Right Site',
	slug: 'right.wordpress.com',
	URL: 'https://right.wordpress.com',
	site_migration: { migration_status: '' },
} as Site;

function makePreview( overrides: Partial< SiteTransferPreview > = {} ): SiteTransferPreview {
	return {
		primary: {
			key: 'plan:10',
			type: 'plan',
			label: 'Business',
			subscription_ids: [ 10 ],
			product_names: [ 'Business' ],
			notes: [],
			blocker: null,
		},
		source_blog_id: 100,
		target_blog_id: 200,
		can_transfer: true,
		blockers: [],
		warnings: [
			{
				code: 'bundled_domain_on_source',
				message: 'bundled.com stays bundled with the plan unless it moves too.',
				item_key: 'domain:bundled.com',
			},
		],
		items: [
			{
				key: 'domain:bundled.com',
				type: 'domain',
				label: 'bundled.com',
				subscription_ids: [ 21, 22 ],
				product_names: [ 'Domain Registration', 'Professional Email' ],
				notes: [],
				blocker: null,
			},
			{
				key: 'domain:other.com',
				type: 'domain',
				label: 'other.com',
				subscription_ids: [ 23 ],
				product_names: [ 'Domain Registration' ],
				notes: [],
				blocker: null,
			},
		],
		state_token: 'state-token',
		...overrides,
	};
}

function mockPreview( preview: SiteTransferPreview ) {
	return nock( API )
		.get( '/wpcom/v2/upgrades/10/site-transfer/preview' )
		.query( { target_blog_id: 200 } )
		.reply( 200, preview );
}

describe( '<SiteTransferReview />', () => {
	test( 'moves the plan with its bundled domain by default', async () => {
		mockPreview( makePreview() );
		const transferScope = nock( API )
			.post( '/wpcom/v2/upgrades/10/site-transfer', {
				target_blog_id: 200,
				state_token: 'state-token',
				subscription_ids: [ 21 ],
			} )
			.reply( 200, {} );

		render(
			<SiteTransferReview
				purchase={ purchase }
				targetSite={ targetSite }
				onChangeSite={ jest.fn() }
			/>
		);

		expect( await screen.findByRole( 'checkbox', { name: 'bundled.com' } ) ).toBeChecked();
		expect( screen.getByRole( 'checkbox', { name: 'other.com' } ) ).not.toBeChecked();
		expect( screen.queryByText( /stays bundled with the plan/ ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Move to Right Site' } ) );

		await waitFor( () => expect( transferScope.isDone() ).toBe( true ) );
	} );

	test( 'warns about the bundled domain when it is left behind', async () => {
		mockPreview( makePreview() );

		render(
			<SiteTransferReview
				purchase={ purchase }
				targetSite={ targetSite }
				onChangeSite={ jest.fn() }
			/>
		);

		await userEvent.click( await screen.findByRole( 'checkbox', { name: 'bundled.com' } ) );

		expect( screen.getByText( /stays bundled with the plan/ ) ).toBeVisible();
	} );

	test( 'explains why the plan cannot move and disables the move', async () => {
		mockPreview(
			makePreview( {
				can_transfer: false,
				blockers: [ { code: 'target_has_plan', message: 'The target site already has a plan.' } ],
			} )
		);

		render(
			<SiteTransferReview
				purchase={ purchase }
				targetSite={ targetSite }
				onChangeSite={ jest.fn() }
			/>
		);

		expect( await screen.findByText( 'The target site already has a plan.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Move to Right Site' } ) ).toBeDisabled();
	} );

	test( 'reloads the preview when it went stale before the move', async () => {
		mockPreview( makePreview() );
		nock( API )
			.post( '/wpcom/v2/upgrades/10/site-transfer' )
			.reply( 409, {
				code: 'site_transfer_stale_preview',
				message: 'Preview the transfer again.',
				data: { status: 409 },
			} );
		const refreshedPreview = mockPreview(
			makePreview( {
				can_transfer: false,
				blockers: [ { code: 'target_has_plan', message: 'The target site already has a plan.' } ],
			} )
		);

		render(
			<SiteTransferReview
				purchase={ purchase }
				targetSite={ targetSite }
				onChangeSite={ jest.fn() }
			/>
		);

		await userEvent.click( await screen.findByRole( 'button', { name: 'Move to Right Site' } ) );

		expect( await screen.findByText( 'The target site already has a plan.' ) ).toBeVisible();
		expect( refreshedPreview.isDone() ).toBe( true );
	} );
} );
