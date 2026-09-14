/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { PartnerManagedNotice } from '../partner-managed-notice';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'Jetpack Security Daily',
		product_slug: 'jetpack_security_t1_yearly',
		is_plan: true,
		is_partner_managed: true,
		is_host_managed: true,
		partner_name: 'Bluehost',
		partner_type: 'hosting_provider',
		...overrides,
	} as Purchase;
}

describe( '<PartnerManagedNotice />', () => {
	test( 'names the host and tells the customer to contact them', () => {
		render( <PartnerManagedNotice purchase={ makePurchase() } /> );
		expect(
			screen.getByText( 'Host Managed Plan. Please contact Bluehost for details.' )
		).toBeVisible();
	} );

	test( 'says "Agency Managed Plan" for an agency partner', () => {
		render(
			<PartnerManagedNotice
				purchase={ makePurchase( {
					is_host_managed: false,
					partner_name: 'Some Agency',
					partner_type: 'a4a_agency',
				} ) }
			/>
		);
		expect(
			screen.getByText( 'Agency Managed Plan. Please contact Some Agency for details.' )
		).toBeVisible();
	} );

	test( 'renders nothing without a partner name to point the customer at', () => {
		const { container } = render(
			<PartnerManagedNotice purchase={ makePurchase( { partner_name: undefined } ) } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );
