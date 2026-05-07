/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import ApmSettings from '../index';
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
			features: { active: [ 'atomic', 'apm' ] },
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

function mockSite( site: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );
}

function mockApmToggle( expectedActive: boolean ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ siteId }/hosting/apm`, ( body ) => {
			expect( body ).toEqual( { active: expectedActive } );
			return true;
		} )
		.reply( 200, JSON.stringify( expectedActive ), { 'Content-Type': 'application/json' } );
}

describe( '<ApmSettings>', () => {
	test( 'shows Enable affordance when APM is disabled', async () => {
		mockSite( businessSite( false ) );

		render( <ApmSettings siteSlug={ siteSlug } /> );

		expect( await screen.findByText( 'APM is disabled' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Enable' } ) ).toBeVisible();
	} );

	test( 'shows Disable affordance when APM is enabled', async () => {
		mockSite( businessSite( true ) );

		render( <ApmSettings siteSlug={ siteSlug } /> );

		expect( await screen.findByText( 'APM is enabled' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Disable' } ) ).toBeVisible();
	} );

	test( 'clicking Disable POSTs { active: false }', async () => {
		mockSite( businessSite( true ) );
		const scope = mockApmToggle( false );

		render( <ApmSettings siteSlug={ siteSlug } /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Disable' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'renders upsell on a plan below Business', async () => {
		mockSite( personalSite );

		render( <ApmSettings siteSlug={ siteSlug } /> );

		expect( await screen.findByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Enable' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Disable' } ) ).not.toBeInTheDocument();
	} );
} );
