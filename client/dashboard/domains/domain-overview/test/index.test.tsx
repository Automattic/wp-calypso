/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, type Domain } from '@automattic/api-core';
import { domainQuery, siteByIdQuery } from '@automattic/api-queries';
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

test( 'shows an SSL problem in the header without opening advanced settings', async () => {
	const domain = {
		domain: 'example.com',
		blog_id: 123,
		registration_date: '2020-01-01',
		ssl_status: 'inactive',
		points_to_wpcom: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
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

	render( <DomainOverview />, { queryClient } );

	expect( await screen.findByRole( 'link', { name: 'View SSL details' } ) ).toBeVisible();
} );
