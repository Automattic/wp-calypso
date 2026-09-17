/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { DnsSecNameserversNotice } from '../notice';
import type { Domain } from '@automattic/api-core';

const domainName = 'example.com';

const getMockedDomainData = ( customProps: Partial< Domain > = {} ): Domain => {
	return {
		domain: domainName,
		is_dnssec_supported: true,
		is_dnssec_enabled: false,
		has_wpcom_nameservers: true,
		...customProps,
	} as Domain;
};

describe( '<DnsSecNameserversNotice>', () => {
	test( 'shows the warning when DNSSEC is supported, off, and the domain uses external name servers', () => {
		const domain = getMockedDomainData( { has_wpcom_nameservers: false } );

		render( <DnsSecNameserversNotice domainName={ domainName } domain={ domain } /> );

		expect( screen.getByText( /your domain is using external name servers/i ) ).toBeVisible();
		expect(
			screen.getByRole( 'link', { name: /you can update your name servers here/i } )
		).toBeVisible();
	} );

	test( 'renders nothing when the domain uses WordPress.com name servers', () => {
		const domain = getMockedDomainData( { has_wpcom_nameservers: true } );

		render( <DnsSecNameserversNotice domainName={ domainName } domain={ domain } /> );

		expect(
			screen.queryByText( /your domain is using external name servers/i )
		).not.toBeInTheDocument();
	} );

	test( 'renders nothing when DNSSEC is already enabled', () => {
		const domain = getMockedDomainData( {
			has_wpcom_nameservers: false,
			is_dnssec_enabled: true,
		} );

		render( <DnsSecNameserversNotice domainName={ domainName } domain={ domain } /> );

		expect(
			screen.queryByText( /your domain is using external name servers/i )
		).not.toBeInTheDocument();
	} );

	test( 'renders nothing when DNSSEC is not supported', () => {
		const domain = getMockedDomainData( {
			is_dnssec_supported: false,
			has_wpcom_nameservers: false,
		} );

		render( <DnsSecNameserversNotice domainName={ domainName } domain={ domain } /> );

		expect(
			screen.queryByText( /your domain is using external name servers/i )
		).not.toBeInTheDocument();
	} );
} );
