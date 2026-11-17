/**
 * @vitest-environment jsdom
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
	test( 'shows the Domain security title and DNSSEC status for a registration', async () => {
		render( <DomainSecuritySettingsSummary domain={ getMockedDomainData() } /> );

		expect( await screen.findByText( 'Domain security' ) ).toBeVisible();
		expect( screen.getByText( 'DNSSEC disabled' ) ).toBeVisible();
	} );

	test( 'shows the Domain security title without a badge for a connection', async () => {
		render(
			<DomainSecuritySettingsSummary
				domain={ getMockedDomainData( {
					subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
				} ) }
			/>
		);

		expect( await screen.findByText( 'Domain security' ) ).toBeVisible();
		expect( screen.queryByText( /DNSSEC/ ) ).not.toBeInTheDocument();
	} );

	test.each( [ 'pending', 'inactive' ] as const )(
		'does not show an SSL badge when the certificate is %s',
		async ( sslStatus ) => {
			render(
				<DomainSecuritySettingsSummary
					domain={ getMockedDomainData( {
						subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
						ssl_status: sslStatus,
					} ) }
				/>
			);

			expect( await screen.findByText( 'Domain security' ) ).toBeVisible();
			expect( screen.queryByText( /SSL/ ) ).not.toBeInTheDocument();
		}
	);
} );
