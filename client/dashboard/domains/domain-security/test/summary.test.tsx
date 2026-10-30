/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import DomainSecuritySettingsSummary from '../summary';

const getMockedDomainData = ( customProps: Partial< Domain > = {} ): Domain => {
	return {
		domain: 'example.com',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		is_dnssec_enabled: false,
		ssl_status: 'active',
		...customProps,
	} as Domain;
};

describe( '<DomainSecuritySettingsSummary>', () => {
	test( 'does not show an SSL badge when the certificate is active', async () => {
		render( <DomainSecuritySettingsSummary domain={ getMockedDomainData() } /> );

		expect( await screen.findByText( 'Domain security' ) ).toBeVisible();
		expect( screen.queryByText( /SSL/ ) ).not.toBeInTheDocument();
	} );

	test( 'shows a pending badge when the certificate is pending', async () => {
		render(
			<DomainSecuritySettingsSummary domain={ getMockedDomainData( { ssl_status: 'pending' } ) } />
		);

		expect( await screen.findByText( 'SSL Pending' ) ).toBeVisible();
	} );

	test( 'shows a disabled badge when the certificate is inactive', async () => {
		render(
			<DomainSecuritySettingsSummary domain={ getMockedDomainData( { ssl_status: 'inactive' } ) } />
		);

		expect( await screen.findByText( 'SSL Disabled' ) ).toBeVisible();
	} );
} );
