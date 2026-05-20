/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SitePerformanceBackend from '../index';
import type { ApmAggregateResponse, Site } from '@automattic/api-core';

jest.mock( '@automattic/charts', () => ( {
	AreaChart: () => null,
	BarListChart: () => null,
	GlobalChartsProvider: ( { children }: { children: React.ReactNode } ) => children,
} ) );

const siteSlug = 'test-site.wordpress.com';
const siteId = 1;

const businessSite = ( apmEnabled: boolean ) =>
	( {
		ID: siteId,
		slug: siteSlug,
		is_wpcom_atomic: true,
		plan: {
			product_slug: 'business-bundle',
			product_name_short: 'Business',
			is_free: false,
			features: { active: [ 'atomic' ] },
		},
		options: { apm_enabled: apmEnabled },
	} ) as unknown as Site;

const personalSite = {
	ID: siteId,
	slug: siteSlug,
	is_wpcom_atomic: false,
	plan: {
		product_slug: 'personal-bundle',
		product_name_short: 'Personal',
		is_free: false,
		features: { active: [] },
	},
} as unknown as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockApmToggle( expectedActive: boolean ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ siteId }/hosting/apm`, ( body ) => {
			expect( body ).toEqual( { active: expectedActive } );
			return true;
		} )
		.reply( 200, JSON.stringify( expectedActive ), { 'Content-Type': 'application/json' } );
}

function mockApmAggregate( response: ApmAggregateResponse = { aggregates: [] } ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ siteId }/hosting/apm/aggregate` )
		.query( true )
		.reply( 200, response );
}

describe( '<SitePerformanceBackend>', () => {
	test( 'renders the dashboard with a Start capturing CTA when APM is disabled', async () => {
		mockSite( businessSite( false ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Response time breakdown' } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Start capturing' } ) ).toBeVisible();
		expect( screen.getByRole( 'status', { name: 'Not capturing' } ) ).toBeVisible();
		expect( screen.getByText( /Capturing is off\./ ) ).toBeVisible();
	} );

	test( 'renders the tabbed dashboard without the Start capturing CTA when APM is enabled', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Response time breakdown' } )
		).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Slowest requests' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Start capturing' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'status', { name: 'Capturing' } ) ).toBeVisible();
		expect( screen.getByText( /Capturing performance data\./ ) ).toBeVisible();
	} );

	test( 'renders Plugins, Hooks and Templates on the WordPress tab', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } tab="wordpress" /> );

		expect( await screen.findByRole( 'heading', { name: 'Plugins' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Hooks' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Templates' } ) ).toBeVisible();
	} );

	test( 'renders Slowest transactions on the Transactions tab', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } tab="transactions" /> );

		expect( await screen.findByRole( 'heading', { name: 'Slowest transactions' } ) ).toBeVisible();
		expect( screen.getByText( /GET \/wp-json\/wp\/v2\/posts/ ) ).toBeVisible();
		expect( screen.getByRole( 'radio', { name: 'Max' } ) ).toBeChecked();
	} );

	test( 'renders Slowest queries on the Database tab', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } tab="database" /> );

		expect( await screen.findByRole( 'heading', { name: 'Slowest queries' } ) ).toBeVisible();
		expect( screen.getByText( /SELECT \* FROM wp_woocommerce_order_items/ ) ).toBeVisible();
	} );

	test( 'renders Slowest external requests on the External tab', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } tab="external-requests" /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Slowest external requests' } )
		).toBeVisible();
		expect( screen.getByText( /api\.stripe\.com/ ) ).toBeVisible();
	} );

	test( 'shows a status notice with the average response time', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		// The notice variant depends on seeded mock data, but one of these three
		// titles must always appear and must include the formatted avg duration.
		expect(
			await screen.findByText(
				/(Healthy backend|Backend needs improvement|Backend is slow) — avg /
			)
		).toBeVisible();
	} );

	test( 'toggling Avg/Max on Slowest requests updates the description', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		// Wait for the Slowest requests card to mount.
		await screen.findByRole( 'heading', { name: 'Slowest requests' } );

		expect( screen.getByText( /Slowest single response observed/ ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'radio', { name: 'Avg' } ) );

		expect(
			screen.getByText( /Average response time across the slowest endpoints/ )
		).toBeVisible();
		expect( screen.queryByText( /Slowest single response observed/ ) ).not.toBeInTheDocument();
	} );

	test( 'clicking Start capturing POSTs { active: true }', async () => {
		mockSite( businessSite( false ) );
		mockApmAggregate();
		const scope = mockApmToggle( true );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Start capturing' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'renders upsell when the site is on a plan below Business', async () => {
		mockSite( personalSite );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect( await screen.findByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Start capturing' } ) ).not.toBeInTheDocument();
	} );
} );
