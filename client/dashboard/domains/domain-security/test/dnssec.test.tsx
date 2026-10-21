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
	test( 'disables the toggle when the domain uses external name servers and DNSSEC is off', () => {
		const domain = getMockedDomainData( {
			has_wpcom_nameservers: false,
			is_dnssec_enabled: false,
		} );

		render( <DnsSec domainName={ domainName } domain={ domain } /> );

		expect( screen.getByRole( 'checkbox', { name: /enable dnssec/i } ) ).toBeDisabled();
	} );

	test( 'enables the toggle when the domain uses WordPress.com name servers', () => {
		const domain = getMockedDomainData( {
			has_wpcom_nameservers: true,
			is_dnssec_enabled: false,
		} );

		render( <DnsSec domainName={ domainName } domain={ domain } /> );

		expect( screen.getByRole( 'checkbox', { name: /enable dnssec/i } ) ).toBeEnabled();
	} );

	test( 'allows disabling DNSSEC even when the domain uses external name servers', () => {
		const domain = getMockedDomainData( {
			has_wpcom_nameservers: false,
			is_dnssec_enabled: true,
		} );

		render( <DnsSec domainName={ domainName } domain={ domain } /> );

		expect( screen.getByRole( 'checkbox', { name: /disable dnssec/i } ) ).toBeEnabled();
	} );
} );
