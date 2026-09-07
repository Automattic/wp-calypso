/**
 * @jest-environment jsdom
 */
import { DomainSubtype } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { DnsRequirementsNotice } from '../dns-requirements-notice';
import type { Domain } from '@automattic/api-core';

function makeDomainData( overrides: Partial< Domain > ): Domain {
	return {
		has_wpcom_nameservers: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...overrides,
	} as Domain;
}

describe( '<DnsRequirementsNotice>', () => {
	// DOTEMP-76
	test( 'shows the DNS requirements notice when using external name servers', () => {
		render(
			<DnsRequirementsNotice
				domainName="example.com"
				domainData={ makeDomainData( { has_wpcom_nameservers: false } ) }
			/>
		);

		expect( screen.getByText( /your domain is using external name servers/i ) ).toBeVisible();
	} );

	// DOTEMP-76
	test( 'hides the DNS requirements notice when using WordPress.com name servers', () => {
		render(
			<DnsRequirementsNotice
				domainName="example.com"
				domainData={ makeDomainData( { has_wpcom_nameservers: true } ) }
			/>
		);

		expect(
			screen.queryByText( /your domain is using external name servers/i )
		).not.toBeInTheDocument();
	} );

	// DOTEMP-76
	test( 'shows a domain connection variant notice when using external name servers on a connected domain', () => {
		render(
			<DnsRequirementsNotice
				domainName="example.com"
				domainData={ makeDomainData( {
					has_wpcom_nameservers: false,
					subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
				} ) }
			/>
		);

		expect( screen.getByText( /your domain is using external name servers/i ) ).toBeVisible();
	} );
} );
