/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SitePerformanceBackend from '../index';
import type { Site } from '@automattic/api-core';

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

describe( '<SitePerformanceBackend>', () => {
	test( 'renders Enable CTA when APM is disabled on a Business site', async () => {
		mockSite( businessSite( false ) );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect( await screen.findByRole( 'button', { name: 'Enable' } ) ).toBeVisible();
		expect( screen.queryByText( 'APM dashboards coming soon.' ) ).not.toBeInTheDocument();
	} );

	test( 'renders enabled placeholder + Disable when APM is already enabled', async () => {
		mockSite( businessSite( true ) );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect( await screen.findByText( 'APM dashboards coming soon.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Disable' } ) ).toBeVisible();
	} );

	test( 'clicking Enable POSTs { active: true }', async () => {
		mockSite( businessSite( false ) );
		const scope = mockApmToggle( true );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Enable' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'clicking Disable POSTs { active: false }', async () => {
		mockSite( businessSite( true ) );
		const scope = mockApmToggle( false );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Disable' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'renders upsell when the site is on a plan below Business', async () => {
		mockSite( personalSite );

		render( <SitePerformanceBackend siteSlug={ siteSlug } /> );

		expect( await screen.findByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Enable' } ) ).not.toBeInTheDocument();
	} );
} );
