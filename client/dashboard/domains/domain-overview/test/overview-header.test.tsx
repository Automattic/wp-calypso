/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, type Domain, type Purchase } from '@automattic/api-core';
import { domainQuery, purchaseQuery, siteByIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import DomainOverview from '../index';

vi.mock( '../../../app/router/domains', async () => ( {
	...( await vi.importActual< typeof import( '../../../app/router/domains' ) >(
		'../../../app/router/domains'
	) ),
	domainRoute: {
		useParams: () => ( { domainName: 'example.com' } ),
	},
} ) );

function renderOverview(
	customDomain: Partial< Domain > = {},
	customPurchase: Partial< Purchase > = {}
) {
	const domain = {
		domain: 'example.com',
		blog_id: 123,
		registration_date: '2020-01-15T12:00:00+00:00',
		auto_renewing: true,
		auto_renewal_date: '2030-07-15T12:00:00+00:00',
		expiry: '2030-06-15T12:00:00+00:00',
		subscription_id: '456',
		current_user_is_owner: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customDomain,
	} as Domain;
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( domainQuery( domain.domain ).queryKey, domain );
	queryClient.setQueryData( siteByIdQuery( domain.blog_id ).queryKey, {
		name: 'My site',
		slug: 'example.wordpress.com',
		site_migration: {},
	} as never );
	queryClient.setQueryData( purchaseQuery( 456 ).queryKey, {
		ID: 456,
		price_integer: 1500,
		currency_code: 'USD',
		can_explicit_renew: false,
		is_renewable: false,
		...customPurchase,
	} as Purchase );

	return render( <DomainOverview />, { queryClient } );
}

describe( 'DomainOverview header', () => {
	test.each( [
		[ 'Registered on January 15, 2020 · Renews on July 15, 2030', {} ],
		[ 'Registered on January 15, 2020 · Expires on June 15, 2030', { auto_renewing: false } ],
		[ 'Registered on January 15, 2020 · Expired on June 15, 2030', { expired: true } ],
	] )( 'says "%s"', async ( text, customDomain ) => {
		renderOverview( customDomain );

		expect( await screen.findByText( text ) ).toBeVisible();
	} );

	test.each( [
		[ 'can_explicit_renew', { can_explicit_renew: true } ],
		[ 'is_renewable', { is_renewable: true } ],
	] )( 'offers Renew to the owner with %s', async ( _, customPurchase ) => {
		renderOverview( {}, customPurchase );

		expect( await screen.findByRole( 'link', { name: /Renew now/ } ) ).toBeVisible();
	} );

	test( 'links back to the domains list from the breadcrumb', async () => {
		renderOverview();

		expect( await screen.findByRole( 'link', { name: 'Domains' } ) ).toHaveAttribute(
			'href',
			'/domains'
		);
	} );
} );
