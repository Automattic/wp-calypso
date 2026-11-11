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
		privacy_available: true,
		subscription_id: '123',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} as Domain;

	return render( <DomainOverviewRegistration domain={ domain } /> );
}

const CONTACT = 'Contact details & privacy';
const RENEWAL = 'Renewal & billing';

describe( 'DomainOverviewRegistration', () => {
	test.each( [
		[ 'Auto-renew on', {} ],
		[ 'Auto-renew off', { auto_renewing: false } ],
		[ 'Expired', { expired: true } ],
	] )( 'shows %s on the renewal row', async ( badge, customProps ) => {
		renderRegistration( customProps );

		expect( await screen.findByText( badge ) ).toBeVisible();
		expect( screen.getByText( CONTACT ) ).toBeVisible();
	} );

	test( 'shows renewal to a non-owner, as the renew card did', async () => {
		renderRegistration( { current_user_is_owner: false, current_user_can_manage: false } );

		expect( await screen.findByText( RENEWAL ) ).toBeVisible();
	} );

	test.each( [
		[ 'has no subscription', { subscription_id: null } ],
		[ 'has no date', { auto_renewal_date: '' } ],
	] )( 'hides renewal when the domain %s', async ( _, customProps ) => {
		renderRegistration( customProps );

		expect( await screen.findByText( CONTACT ) ).toBeVisible();
		expect( screen.queryByText( RENEWAL ) ).not.toBeInTheDocument();
	} );

	const contactRow = () => screen.getByRole( 'link', { name: /Contact details/ } );

	test.each< [ string, Partial< Domain > ] >( [
		[ 'an expired domain', { expired: true } ],
		[ 'a pending transfer', { pending_transfer: true } ],
		[ 'a site redirect', { subtype: { id: DomainSubtype.SITE_REDIRECT, label: 'Site Redirect' } } ],
	] )( 'keeps the link to contact details for %s', async ( _, customProps ) => {
		renderRegistration( customProps );

		await screen.findByText( CONTACT );
		expect( contactRow() ).toHaveAttribute( 'href', '/domains/example.com/contact-info' );
	} );

	test( 'links to the registry policy when privacy is unavailable and the page can’t open', async () => {
		renderRegistration( { current_user_can_manage: false, privacy_available: false } );

		await screen.findByText( CONTACT );
		expect( contactRow() ).toHaveAttribute(
			'href',
			expect.stringContaining( 'privacy-protection' )
		);
	} );

	test( 'shows a disabled row with the privacy state to a non-manager', async () => {
		renderRegistration( { current_user_can_manage: false, private_domain: true } );

		await screen.findByText( CONTACT );
		expect( contactRow() ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( screen.getByText( 'Privacy protection on' ) ).toBeVisible();
	} );

	test( 'opens contact details in a support session', async () => {
		( isSupportSession as jest.Mock ).mockReturnValue( true );
		renderRegistration( { current_user_can_manage: false } );

		await screen.findByText( CONTACT );
		expect( contactRow() ).toHaveAttribute( 'href', '/domains/example.com/contact-info' );
	} );

	test( 'hides the section for a connected domain', async () => {
		const { router } = renderRegistration( {
			subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
		} );

		await router.load();
		expect( screen.queryByText( 'Registration' ) ).not.toBeInTheDocument();
	} );
} );
