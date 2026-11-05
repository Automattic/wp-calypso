/**
 * @jest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../test-utils';
import Domains from '../index';
import type { View } from '@wordpress/dataviews';

jest.mock( '../../app/router/domains', () => {
	const actual = jest.requireActual( '../../app/router/domains' );
	return {
		...actual,
		domainsIndexRoute: {
			...actual.domainsIndexRoute,
			useSearch: () => ( {} ),
			fullPath: '/domains',
		},
	};
} );

jest.mock( '../../app/router/sites', () => {
	const actual = jest.requireActual( '../../app/router/sites' );
	return { ...actual, siteRoute: { fullPath: '/sites/$siteSlug' } };
} );

const mockDomain = ( name: string ) => ( {
	domain: name,
	blog_id: 1,
	blog_name: 'Test Site',
	site_slug: 'test-site.wordpress.com',
	subtype: { id: 'domain_registration', label: 'Domain name registration' },
	domain_status: { id: 'active', label: 'Active', type: 'success' },
	auto_renewing: true,
	current_user_is_owner: true,
	is_domain_only_site: false,
	expiry: '2030-01-01',
	expired: false,
	primary_domain: false,
	can_set_as_primary: false,
	subscription_id: '1',
	tags: [],
} );

function mockApis( savedView: Partial< View > ) {
	const scope = nock( 'https://public-api.wordpress.com' ).persist();
	scope
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, {
			sites: [ { ID: 1, name: 'Test Site', slug: 'test-site.wordpress.com', site_owner: 1 } ],
		} );
	scope
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains: [ mockDomain( 'a-domain.com' ), mockDomain( 'b-domain.com' ) ] } );
	scope
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: { 'hosting-dashboard-dataviews-view-domains': savedView },
		} );
	scope
		.get( /\/wpcom\/v2\/domains\/ssl\/.*/ )
		.query( true )
		.reply( 200, { data: { certificate_provisioned: true, is_newly_registered: false } } );
}

const SAVED_VIEW = {
	titleField: 'domain',
	sort: { field: 'domain', direction: 'desc' },
	fields: [ 'blog_name', 'domain_status' ],
} as const;

describe( '<Domains> saved layouts', () => {
	test( 'shows a saved view with an unavailable layout as a table and records it once', async () => {
		mockApis( { ...SAVED_VIEW, type: 'grid', layout: { previewSize: 290 } } );

		const { recordTracksEvent } = render( <Domains /> );

		const table = await screen.findByRole( 'table' );
		expect(
			within( table )
				.getAllByText( /-domain\.com$/ )
				.map( ( name ) => name.textContent )
		).toEqual( [ 'b-domain.com', 'a-domain.com' ] );
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();

		const fallbackEvents = recordTracksEvent.mock.calls.filter(
			( [ eventName ] ) => eventName === 'calypso_dashboard_domains_saved_layout_fallback'
		);
		expect( fallbackEvents ).toEqual( [
			[
				'calypso_dashboard_domains_saved_layout_fallback',
				{ saved_layout: 'grid', fallback_layout: 'table' },
			],
		] );
	} );

	test( 'records nothing when the saved layout is available', async () => {
		mockApis( { ...SAVED_VIEW, type: 'table' } );

		const { recordTracksEvent } = render( <Domains /> );

		await screen.findByRole( 'table' );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_domains_saved_layout_fallback',
			expect.anything()
		);
	} );
} );
