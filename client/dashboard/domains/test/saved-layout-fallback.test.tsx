/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
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

const SAVED_VIEW: Partial< View > = {
	titleField: 'domain',
	sort: { field: 'domain', direction: 'desc' },
	fields: [ 'blog_name', 'domain_status' ],
};

describe( '<Domains> saved layouts', () => {
	test.each( [ 'list', 'table' ] )(
		'shows a saved %s view as cards and records it once',
		async ( savedLayout ) => {
			mockApis( { ...SAVED_VIEW, type: savedLayout } as Partial< View > );

			const { recordTracksEvent } = render( <Domains /> );

			await screen.findByRole( 'group', { name: 'a-domain.com' } );
			expect(
				screen.getAllByRole( 'heading', { level: 3 } ).map( ( heading ) => heading.textContent )
			).toEqual( [ 'b-domain.com', 'a-domain.com' ] );
			expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_domains_saved_layout_fallback',
				{ saved_layout: savedLayout, fallback_layout: 'grid' }
			);
			const fallbackEventCount = ( recordTracksEvent as jest.Mock ).mock.calls.filter(
				( [ eventName ] ) => eventName === 'calypso_dashboard_domains_saved_layout_fallback'
			).length;
			expect( fallbackEventCount ).toBe( 1 );
		}
	);

	test( 'keeps a saved grid view on the cards', async () => {
		mockApis( { ...SAVED_VIEW, type: 'grid' } as Partial< View > );

		const { recordTracksEvent } = render( <Domains /> );

		await screen.findByRole( 'group', { name: 'a-domain.com' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_domains_saved_layout_fallback',
			expect.anything()
		);
	} );
} );
