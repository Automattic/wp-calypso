/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DomainsTable } from '..';
import type { PartialDomainData } from '@automattic/data-stores';

function testDomain( defaults: Partial< PartialDomainData > = {} ): PartialDomainData {
	return {
		domain: 'example.com',
		blog_id: 113,
		type: 'mapping',
		is_wpcom_staging_domain: false,
		has_registration: true,
		registration_date: '2020-03-11T22:23:58+00:00',
		expiry: '2026-03-11T00:00:00+00:00',
		wpcom_domain: false,
		current_user_is_owner: true,
		...defaults,
	};
}

test( 'all domain names are rendered in the table', () => {
	const { rerender } = render(
		<DomainsTable
			domains={ [
				testDomain( { domain: 'example1.com' } ),
				testDomain( { domain: 'example2.com' } ),
				testDomain( { domain: 'example3.com' } ),
			] }
		/>
	);

	expect( screen.queryByText( 'example1.com' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'example2.com' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'example3.com' ) ).toBeInTheDocument();

	rerender( <DomainsTable domains={ [] } /> );

	expect( screen.queryByText( 'example1.com' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'example2.com' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'example3.com' ) ).not.toBeInTheDocument();
} );
