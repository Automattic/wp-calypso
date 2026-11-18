/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, type Domain, type Purchase } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import RenewalPaymentMethodNotice from '../renewal-payment-method-notice';

const NO_PAYMENT_METHOD_TITLE = 'Add a payment method';
const EXPIRED_CARD_TITLE = 'Your payment method has expired';

const domainFixture = ( customProps: Partial< Domain > = {} ): Domain =>
	( {
		domain: 'example.com',
		auto_renewing: true,
		expired: false,
		expiry: '2030-06-15T12:00:00+00:00',
		current_user_is_owner: true,
		subscription_id: '123',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} ) as Domain;

const purchaseFixture = ( customProps: Partial< Purchase > = {} ): Purchase =>
	( {
		ID: 123,
		expiry_status: 'manual-renew',
		expiry_date: '2030-06-15T12:00:00+00:00',
		is_renewable: true,
		can_explicit_renew: true,
		...customProps,
	} ) as Purchase;

const renderNotice = (
	domain: Partial< Domain > = {},
	purchase: Partial< Purchase > | null = {}
) =>
	render(
		<RenewalPaymentMethodNotice
			domain={ domainFixture( domain ) }
			purchase={ purchase ? purchaseFixture( purchase ) : undefined }
		/>
	);

describe( '<RenewalPaymentMethodNotice>', () => {
	test( 'tells the owner the subscription has no payment method to charge', async () => {
		renderNotice();

		expect( await screen.findByText( NO_PAYMENT_METHOD_TITLE ) ).toBeVisible();
		expect( screen.getByText( /It expires on June 15, 2030/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Add payment method' } ) ).toBeVisible();
	} );

	test( 'tells the owner the card on the subscription has expired', async () => {
		renderNotice(
			{},
			{
				expiry_status: 'auto-renewing',
				payment_type: 'credit_card',
				payment_card_type: 'visa',
				payment_details: '1234',
				payment_expiry_date: '2020-01-31',
			}
		);

		expect( await screen.findByText( EXPIRED_CARD_TITLE ) ).toBeVisible();
		expect( screen.getByText( /visa ending in 1234 has expired/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Update payment method' } ) ).toBeVisible();
	} );

	test( 'leaves renewing to the header button rather than repeating it', async () => {
		renderNotice();

		expect( await screen.findByText( NO_PAYMENT_METHOD_TITLE ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Renew now' } ) ).not.toBeInTheDocument();
	} );

	test.each< [ string, Partial< Domain >, Partial< Purchase > | null ] >( [
		[ 'the subscription can still be charged', {}, { expiry_status: 'auto-renewing' } ],
		[ 'auto-renew is off', { auto_renewing: false }, {} ],
		[ 'the domain already expired', { expired: true }, {} ],
		[ 'the user is not the owner', { current_user_is_owner: false }, {} ],
		[ 'there is no purchase to act on', {}, null ],
	] )( 'shows nothing when %s', async ( _, domain, purchase ) => {
		renderNotice( domain, purchase );

		expect( screen.queryByText( NO_PAYMENT_METHOD_TITLE ) ).not.toBeInTheDocument();
		expect( screen.queryByText( EXPIRED_CARD_TITLE ) ).not.toBeInTheDocument();
	} );
} );
