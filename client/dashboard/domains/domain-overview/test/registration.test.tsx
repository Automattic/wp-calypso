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

function renderRegistration( customProps: Partial< Domain > = {} ) {
	const domain = {
		domain: 'example.com',
		auto_renewing: true,
		auto_renewal_date: '2030-07-15T12:00:00+00:00',
		expiry: '2030-06-15T12:00:00+00:00',
		current_user_can_manage: true,
		subscription_id: '123',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} as Domain;

	return render( <DomainOverviewRegistration domain={ domain } /> );
}

const CONTACT = 'Contact details & privacy';
const RENEWAL = 'Renewal & billing';

describe( 'DomainOverviewRegistration', () => {
	test( 'shows the renewal date and contact details', async () => {
		renderRegistration();

		expect( await screen.findByText( 'Renews on July 15, 2030' ) ).toBeVisible();
		expect( screen.getByText( CONTACT ) ).toBeVisible();
	} );

	test( 'says auto-renew is off and when the domain expires', async () => {
		renderRegistration( { auto_renewing: false } );

		expect( await screen.findByText( 'Auto-renew off' ) ).toBeVisible();
		expect( screen.getByText( 'Expires on June 15, 2030' ) ).toBeVisible();
	} );

	test( 'flags an expired domain', async () => {
		renderRegistration( { expired: true } );

		expect( await screen.findByText( 'Expired on June 15, 2030' ) ).toBeVisible();
	} );

	test( 'shows renewal to a non-owner, as the renew card did', async () => {
		renderRegistration( { current_user_is_owner: false, current_user_can_manage: false } );

		expect( await screen.findByText( RENEWAL ) ).toBeVisible();
		expect( screen.queryByText( CONTACT ) ).not.toBeInTheDocument();
	} );

	test.each( [
		[ 'has no subscription', { subscription_id: null } ],
		[ 'has no date', { auto_renewal_date: '' } ],
	] )( 'hides renewal when the domain %s', async ( _, customProps ) => {
		renderRegistration( customProps );

		expect( await screen.findByText( CONTACT ) ).toBeVisible();
		expect( screen.queryByText( RENEWAL ) ).not.toBeInTheDocument();
	} );

	test.each( [
		[ 'the domain is expired', { expired: true } ],
		[ 'a transfer is pending', { pending_transfer: true } ],
		[
			'the domain is a site redirect',
			{ subtype: { id: DomainSubtype.SITE_REDIRECT, label: 'Site Redirect' } },
		],
	] )( 'keeps renewal but hides contact details when %s', async ( _, customProps ) => {
		renderRegistration( customProps );

		expect( await screen.findByText( RENEWAL ) ).toBeVisible();
		expect( screen.queryByText( CONTACT ) ).not.toBeInTheDocument();
	} );

	test( 'shows contact details in a support session', async () => {
		( isSupportSession as jest.Mock ).mockReturnValue( true );
		renderRegistration( { current_user_can_manage: false } );

		expect( await screen.findByText( CONTACT ) ).toBeVisible();
	} );

	test( 'hides the section for a connected domain', async () => {
		const { router } = renderRegistration( {
			subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
		} );

		await router.load();
		expect( screen.queryByText( 'Registration' ) ).not.toBeInTheDocument();
	} );
} );
