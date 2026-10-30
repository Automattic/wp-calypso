/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import DomainOverviewRegistration from '../registration';

jest.mock( '@automattic/calypso-support-session', () => ( {
	isSupportSession: jest.fn( () => false ),
} ) );

afterEach( () => {
	( isSupportSession as jest.Mock ).mockReturnValue( false );
} );

const mockDomain = ( customProps: Partial< Domain > = {} ): Domain =>
	( {
		domain: 'example.com',
		auto_renewing: true,
		current_user_can_manage: true,
		expired: false,
		pending_transfer: false,
		private_domain: true,
		subscription_id: '123',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} ) as Domain;

function renderRegistration( customProps: Partial< Domain > = {} ) {
	return render( <DomainOverviewRegistration domain={ mockDomain( customProps ) } /> );
}

describe( 'DomainOverviewRegistration', () => {
	test( 'shows renewal and contact details for a registered domain', async () => {
		renderRegistration();

		expect( await screen.findByText( 'Registration' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Renewal & billing/ } ) ).toBeVisible();
		expect( screen.getByText( 'Auto-renew on' ) ).toBeVisible();
		expect( screen.getByText( 'Contact details & privacy' ) ).toBeVisible();
		expect( screen.getByText( 'Privacy protection on' ) ).toBeVisible();
	} );

	test( 'flags when auto-renew is off', async () => {
		renderRegistration( { auto_renewing: false } );

		expect( await screen.findByText( 'Auto-renew off' ) ).toBeVisible();
	} );

	test( 'flags an expired domain and hides contact details', async () => {
		renderRegistration( { auto_renewing: false, expired: true } );

		expect( await screen.findByText( 'Expired' ) ).toBeVisible();
		expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
	} );

	test( 'hides contact details when the user cannot manage the domain', async () => {
		renderRegistration( { current_user_can_manage: false } );

		expect( await screen.findByText( 'Renewal & billing' ) ).toBeVisible();
		expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
	} );

	test( 'shows contact details in a support session', async () => {
		( isSupportSession as jest.Mock ).mockReturnValue( true );
		renderRegistration( { current_user_can_manage: false } );

		expect( await screen.findByText( 'Contact details & privacy' ) ).toBeVisible();
	} );

	test( 'hides contact details for a pending transfer', async () => {
		renderRegistration( { pending_transfer: true } );

		expect( await screen.findByText( 'Renewal & billing' ) ).toBeVisible();
		expect( screen.queryByText( 'Contact details & privacy' ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing for a connected domain', () => {
		const { container } = renderRegistration( {
			subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
		} );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
