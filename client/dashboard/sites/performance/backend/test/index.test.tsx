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

function aggregateFixture(): ApmAggregateResponse {
	return {
		aggregates: [
			{
				feature: 'atomic_apm_trace_minute',
				atomic_site_id: siteId,
				blog_id: siteId,
				extra: {
					bucket_minute: '2026-05-19T15:30:00Z',
					transactions: {
						count: 10,
						duration_ms: { sum: 5000, avg: 500, max: 1200 },
						span_count_sum: 100,
					},
					breakdown_ms: {
						db: { self_sum: 100, span_count: 50, avg: 2 },
						wp: { self_sum: 200, span_count: 30, avg: 6.67 },
						wp_core: { self_sum: 80, span_count: 20, avg: 4 },
						plugins: { self_sum: 300, span_count: 25, avg: 12 },
						cache: { self_sum: 30, span_count: 40, avg: 0.75 },
						external: { self_sum: 50, span_count: 5, avg: 10 },
						template: { self_sum: 10, span_count: 8, avg: 1.25 },
						other: { self_sum: 0, span_count: 0, avg: 0 },
					},
					slowest: {
						routes: [
							{
								method: 'GET',
								route: '/wp-json/wp/v2/posts',
								tx_count: 5,
								duration_ms: { sum: 2500, avg: 500, max: 1200 },
							},
						],
						plugins: [ { name: 'jetpack', self_sum_ms: 250, count: 30, max_wallclock_ms: 50 } ],
						hooks: [ { action: 'init', total_sum_ms: 400, count: 10, max_wallclock_ms: 80 } ],
						templates: [ { name: 'single.php', total_sum_ms: 10, count: 5, max_wallclock_ms: 3 } ],
						db_queries: [
							{
								fingerprint: 'SELECT * FROM wp_woocommerce_order_items WHERE order_id = ?',
								fingerprint_id: 'abc123',
								op: 'select',
								table: 'wp_woocommerce_order_items',
								self_sum_ms: 80,
								count: 20,
								max_wallclock_ms: 12,
							},
						],
						cache: [
							{
								op: 'get',
								key_prefix: 'options',
								self_sum_ms: 20,
								count: 30,
								max_wallclock_ms: 1,
							},
						],
						externals: [
							{
								host: 'api.stripe.com',
								method: 'POST',
								self_sum_ms: 40,
								count: 3,
								max_wallclock_ms: 20,
							},
						],
					},
				},
			},
		],
	};
}

describe( '<SitePerformanceBackend>', () => {
	test( 'renders the timeframe-scoped empty state with a Start capturing CTA when APM is disabled and no data', async () => {
		mockSite( businessSite( false ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		// Default timeframe is "last hour" (rolling), so the title reflects that.
		expect(
			await screen.findByRole( 'heading', { name: 'No APM data in the last hour' } )
		).toBeVisible();
		expect( screen.getByText( /Capturing is off\. Turn it on/ ) ).toBeVisible();
		// Empty state has its own CTA, and the header keeps the original one.
		expect( screen.getAllByRole( 'button', { name: 'Start capturing' } )[ 0 ] ).toBeVisible();
		expect( screen.getByRole( 'status', { name: 'Not capturing' } ) ).toBeVisible();
		// Charts and tabs should NOT be visible in the empty state.
		expect(
			screen.queryByRole( 'heading', { name: 'Response time breakdown' } )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: 'Slowest requests' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders the tabbed dashboard without the Start capturing CTA when APM is enabled and data is present', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate( aggregateFixture() );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Response time breakdown' } )
		).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Slowest requests' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Start capturing' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'status', { name: 'Capturing' } ) ).toBeVisible();
		expect( screen.getByText( /Capturing performance data\./ ) ).toBeVisible();
	} );

	test( 'shows the Capturing notice (not the empty state) when APM is on but no data has come in yet', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		// The dashboard still renders with the "Capturing" notice — the empty
		// state is reserved for when the user has to take action (APM off).
		expect( await screen.findByText( /Performance data is being collected/ ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: /^No APM data in/ } ) ).not.toBeInTheDocument();
	} );

	test( 'renders Plugins, Hooks and Templates on the WordPress tab', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate( aggregateFixture() );

		render( <SitePerformanceBackend siteSlug={ siteSlug } tab="wordpress" /> );

		expect( await screen.findByRole( 'heading', { name: 'Plugins' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Hooks' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Templates' } ) ).toBeVisible();
	} );

	test( 'renders Slowest transactions on the Transactions tab', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate( aggregateFixture() );

		render( <SitePerformanceBackend siteSlug={ siteSlug } tab="transactions" /> );

		expect( await screen.findByRole( 'heading', { name: 'Slowest transactions' } ) ).toBeVisible();
		expect( screen.getByText( /GET \/wp-json\/wp\/v2\/posts/ ) ).toBeVisible();
		expect( screen.getByRole( 'radio', { name: 'Max' } ) ).toBeChecked();
	} );

	test( 'renders Slowest queries on the Database tab', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate( aggregateFixture() );

		render( <SitePerformanceBackend siteSlug={ siteSlug } tab="database" /> );

		expect( await screen.findByRole( 'heading', { name: 'Slowest queries' } ) ).toBeVisible();
		expect( screen.getByText( /SELECT \* FROM wp_woocommerce_order_items/ ) ).toBeVisible();
	} );

	test( 'renders Slowest external requests on the External tab', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate( aggregateFixture() );

		render( <SitePerformanceBackend siteSlug={ siteSlug } tab="external-requests" /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Slowest external requests' } )
		).toBeVisible();
		expect( screen.getByText( /api\.stripe\.com/ ) ).toBeVisible();
	} );

	test( 'shows an intent-based status notice when data is present', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate( aggregateFixture() );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		// With real data, the notice variant depends on the avg response time,
		// but one of these three titles must always appear with the formatted avg.
		expect(
			await screen.findByText(
				/(Healthy backend|Backend needs improvement|Backend is slow) — avg /
			)
		).toBeVisible();
	} );

	test( 'does not show the intent-based status notice when there is no data', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate();

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		// Wait for the dashboard to render before asserting absence.
		await screen.findByRole( 'heading', { name: 'Response time breakdown' } );

		expect(
			screen.queryByText( /(Healthy backend|Backend needs improvement|Backend is slow) — avg / )
		).not.toBeInTheDocument();
	} );

	test( 'toggling Avg/Max on Slowest requests updates the description', async () => {
		mockSite( businessSite( true ) );
		mockApmAggregate( aggregateFixture() );

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

		// With no data and APM off, both the header CTA and the empty-state CTA are
		// rendered. Either one should perform the same POST; click the first one.
		const buttons = await screen.findAllByRole( 'button', { name: 'Start capturing' } );
		await userEvent.click( buttons[ 0 ] );

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
