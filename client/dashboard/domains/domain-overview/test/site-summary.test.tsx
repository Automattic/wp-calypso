/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain, type Site } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import DomainSiteSettingsSummary from '../site-summary';

function renderSummary( customProps: Partial< Domain > = {} ) {
	const domain = {
		domain: 'example.com',
		blog_id: 123,
		site_slug: 'example.wordpress.com',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} as Domain;

	const queryClient = new QueryClient( { defaultOptions: { queries: { staleTime: Infinity } } } );
	queryClient.setQueryData( siteByIdQuery( domain.blog_id ).queryKey, {
		name: 'My site',
		slug: 'example.wordpress.com',
		URL: 'https://example.wordpress.com',
		icon: { img: 'https://example.wordpress.com/icon.png' },
		site_migration: {},
	} as Site );

	return render( <DomainSiteSettingsSummary domain={ domain } />, { queryClient } );
}

describe( 'DomainSiteSettingsSummary', () => {
	test( 'shows the site favicon and name without linking to the site', async () => {
		renderSummary();

		expect( await screen.findByRole( 'img', { name: 'My site' } ) ).toBeVisible();
		expect( screen.getByText( 'My site' ) ).toBeVisible();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'offers to attach a domain-only domain to a site', async () => {
		renderSummary( { is_domain_only_site: true, can_transfer_to_other_site: true } );

		expect( await screen.findByRole( 'link', { name: /No site attached/ } ) ).toHaveAttribute(
			'href',
			'/domains/example.com/transfer/other-site'
		);
		expect( screen.queryByRole( 'img' ) ).not.toBeInTheDocument();
	} );
} );
