/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import { LaunchAgencyDevelopmentSiteForm } from '../launch-form';
import type { AgencySupports, AppConfig } from '../../../app/context';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 55,
	slug: 'dev.example.com',
	URL: 'https://dev.example.com',
	name: 'Dev site',
	launch_status: 'unlaunched',
	is_a4a_dev_site: true,
	plan: { product_slug: 'business-bundle', is_free: false },
} as Site;

const agencyDashboardConfig: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		agency: { marketplace: true } as AgencySupports,
	},
};

function mockApi() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains: [] } )
		.get( `/wpcom/v2/agency/blog/${ site.ID }` )
		.query( true )
		.reply( 200, {
			name: 'Test Agency',
			billing_system: 'billingdragon',
			referral_status: 'pending',
			existing_wpcom_license_count: 0,
			prices: { actual_price: 0, currency: 'USD' },
		} );
}

async function getLinks() {
	const launchUrl = new URL(
		( await screen.findByRole( 'link', { name: 'Launch your site' } ) ).getAttribute( 'href' ) ??
			'',
		window.location.origin
	);
	const referUrl = new URL(
		screen.getByRole( 'link', { name: 'Refer a client' } ).getAttribute( 'href' ) ?? '',
		window.location.origin
	);
	return { launchUrl, referUrl };
}

describe( '<LaunchAgencyDevelopmentSiteForm>', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'launches and refers a Billing Dragon site through the dashboard checkouts on the agency dashboard', async () => {
		mockApi();
		render( <LaunchAgencyDevelopmentSiteForm site={ site } />, { config: agencyDashboardConfig } );

		const { launchUrl, referUrl } = await getLinks();
		expect( launchUrl.origin ).toBe( window.location.origin );
		expect( launchUrl.pathname ).toBe(
			'/checkout/agency/purchase/dev.example.com/wpcom-hosting-business'
		);
		expect( referUrl.origin ).toBe( window.location.origin );
		expect( referUrl.pathname ).toBe( '/referral-checkout' );
		expect( referUrl.searchParams.get( 'referral_blog_id' ) ).toBe( '55' );
	} );

	test( 'keeps the Automattic for Agencies dashboard checkouts where the agency routes are not registered', async () => {
		mockApi();
		render( <LaunchAgencyDevelopmentSiteForm site={ site } /> );

		const { launchUrl, referUrl } = await getLinks();
		expect( launchUrl.hostname ).toMatch( /^agencies\./ );
		expect( launchUrl.pathname ).toBe(
			'/marketplace/checkout/dev.example.com/a4a_wp_bundle_business_yearly'
		);
		expect( referUrl.hostname ).toMatch( /^agencies\./ );
		expect( referUrl.pathname ).toBe( '/marketplace/checkout' );
		expect( referUrl.searchParams.get( 'referral_blog_id' ) ).toBe( '55' );
	} );
} );
