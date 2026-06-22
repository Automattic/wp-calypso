/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import DnsSec from '../dnssec';
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

describe( '<DnsSec>', () => {
	test( 'shows external name servers notice and disables the toggle when the domain uses external name servers', () => {
		const domain = getMockedDomainData( {
			has_wpcom_nameservers: false,
			is_dnssec_enabled: false,
		} );

		render( <DnsSec domainName={ domainName } domain={ domain } /> );

		expect( screen.getByText( /your domain is using external name servers/i ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox', { name: /enable dnssec/i } ) ).toBeDisabled();
	} );

	test( 'enables the toggle and hides the notice when the domain uses WordPress.com name servers', () => {
		const domain = getMockedDomainData( {
			has_wpcom_nameservers: true,
			is_dnssec_enabled: false,
		} );

		render( <DnsSec domainName={ domainName } domain={ domain } /> );

		expect(
			screen.queryByText( /your domain is using external name servers/i )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'checkbox', { name: /enable dnssec/i } ) ).toBeEnabled();
	} );

	test( 'allows disabling DNSSEC even when the domain uses external name servers', () => {
		const domain = getMockedDomainData( {
			has_wpcom_nameservers: false,
			is_dnssec_enabled: true,
		} );

		render( <DnsSec domainName={ domainName } domain={ domain } /> );

		expect(
			screen.queryByText( /your domain is using external name servers/i )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'checkbox', { name: /disable dnssec/i } ) ).toBeEnabled();
	} );
} );
