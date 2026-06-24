/**
 * @jest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { DomainExpiryField } from '../field-expiry';
import type { DomainSummary } from '@automattic/api-core';

const getMockedDomain = ( customProps: Partial< DomainSummary > = {} ): DomainSummary =>
	( {
		domain: 'example.com',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
		auto_renewing: false,
		expired: false,
		expiry: '2027-01-01',
		subscription_id: 'sub123',
		is_domain_only_site: false,
		domain_status: { id: DomainStatus.ACTIVE, label: 'Active', type: 'success' },
		...customProps,
	} ) as DomainSummary;

describe( '<DomainExpiryField>', () => {
	test( 'offers "Turn on auto-renew" for an active domain with auto-renew off', () => {
		render(
			<DomainExpiryField
				inOverview={ false }
				domain={ getMockedDomain() }
				value="January 1, 2027"
			/>
		);

		expect( screen.getByRole( 'link', { name: 'Turn on auto-renew' } ) ).toBeVisible();
	} );

	test( 'shows "Auto-renew is on" when auto-renew is enabled', () => {
		render(
			<DomainExpiryField
				inOverview={ false }
				domain={ getMockedDomain( { auto_renewing: true } ) }
				value="January 1, 2027"
			/>
		);

		expect( screen.getByText( 'Auto-renew is on' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Turn on auto-renew' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not offer "Turn on auto-renew" for an expired domain', () => {
		render(
			<DomainExpiryField
				inOverview={ false }
				domain={ getMockedDomain( {
					expired: true,
					domain_status: { id: DomainStatus.EXPIRED, label: 'Expired', type: 'error' },
				} ) }
				value="January 1, 2024"
			/>
		);

		expect( screen.queryByRole( 'link', { name: 'Turn on auto-renew' } ) ).not.toBeInTheDocument();
	} );
} );
