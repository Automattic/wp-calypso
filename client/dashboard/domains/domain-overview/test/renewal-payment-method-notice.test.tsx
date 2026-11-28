/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, type Domain, type Purchase } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import RenewalPaymentMethodNotice from '../renewal-payment-method-notice';

const NO_PAYMENT_METHOD_TITLE = 'Add a payment method';
const EXPIRED_CARD_TITLE = 'Your payment method has expired';
const AUTO_RENEW_OFF_TITLE = 'Auto-renew is off';
const EXPIRING_SOON_TITLE = 'This domain expires soon';

const daysFromNow = ( days: number ) =>
	new Date( Date.now() + days * 24 * 60 * 60 * 1000 ).toISOString();

const domainFixture = ( customProps: Partial< Domain > = {} ): Domain =>
	( {
		domain: 'example.com',
		auto_renewing: true,
		expired: false,
		expiry: '2030-06-15T12:00:00+00:00',
		current_user_is_owner: true,
		subscription_id: '123',
		tld_maintenance_end_time: 0,
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
		is_auto_renew_enabled: true,
		...customProps,
	} ) as Purchase;

const AUTO_RENEW_OFF = { is_auto_renew_enabled: false };

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

	test( 'does not offer to renew when the subscription has no payment method', async () => {
		renderNotice();

		expect( await screen.findByText( NO_PAYMENT_METHOD_TITLE ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Renew now' } ) ).not.toBeInTheDocument();
	} );

	test( 'tells the owner auto-renew is off however far away the expiry date is', async () => {
		renderNotice( { auto_renewing: false }, AUTO_RENEW_OFF );

		expect( await screen.findByText( AUTO_RENEW_OFF_TITLE ) ).toBeVisible();
		expect( screen.getByText( /It expires on June 15, 2030/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Turn on auto-renew' } ) ).toBeVisible();
		expect( screen.queryByText( EXPIRING_SOON_TITLE ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Renew domain' } ) ).not.toBeInTheDocument();
	} );

	test( 'offers to renew a domain with auto-renew off that is close to expiring', async () => {
		renderNotice(
			{ auto_renewing: false },
			{ ...AUTO_RENEW_OFF, expiry_status: 'expiring', expiry_date: daysFromNow( 30 ) }
		);

		expect( await screen.findByText( EXPIRING_SOON_TITLE ) ).toBeVisible();
		expect( screen.getByText( /Auto-renew is off.*It expires on June 15, 2030/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Renew domain' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/checkout/' )
		);
		expect( screen.queryByRole( 'link', { name: 'Turn on auto-renew' } ) ).not.toBeInTheDocument();
	} );

	test.each< [ string, Partial< Domain >, Partial< Purchase > ] >( [
		[ 'the purchase cannot be renewed right now', {}, { can_explicit_renew: false } ],
		[ 'the TLD is in maintenance', { tld_maintenance_end_time: 1900000000 }, {} ],
	] )(
		'only offers auto-renew for a domain close to expiring when %s',
		async ( _, domain, purchase ) => {
			renderNotice(
				{ auto_renewing: false, ...domain },
				{ ...AUTO_RENEW_OFF, expiry_date: daysFromNow( 30 ), ...purchase }
			);

			expect( await screen.findByText( AUTO_RENEW_OFF_TITLE ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'Turn on auto-renew' } ) ).toBeVisible();
			expect( screen.queryByRole( 'link', { name: 'Renew domain' } ) ).not.toBeInTheDocument();
		}
	);

	test( 'offers to renew once the purchase is past its expiry date', async () => {
		renderNotice(
			{ auto_renewing: false },
			{ ...AUTO_RENEW_OFF, expiry_status: 'expired', expiry_date: daysFromNow( -1 ) }
		);

		expect( await screen.findByText( EXPIRING_SOON_TITLE ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Renew domain' } ) ).toBeVisible();
	} );

	test( 'reads auto-renew from the purchase when the domain reports it as off', async () => {
		renderNotice(
			{ auto_renewing: false },
			{
				expiry_status: 'auto-renewing',
				payment_type: 'credit_card',
				payment_card_type: 'visa',
				payment_details: '1234',
				payment_expiry_date: '2020-01-31',
			}
		);

		expect( await screen.findByText( EXPIRED_CARD_TITLE ) ).toBeVisible();
		expect( screen.queryByText( AUTO_RENEW_OFF_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'ignores an expired card when auto-renew is off', async () => {
		renderNotice(
			{ auto_renewing: false },
			{
				...AUTO_RENEW_OFF,
				payment_type: 'credit_card',
				payment_card_type: 'visa',
				payment_details: '1234',
				payment_expiry_date: '2020-01-31',
			}
		);

		expect( await screen.findByText( AUTO_RENEW_OFF_TITLE ) ).toBeVisible();
		expect( screen.queryByText( EXPIRED_CARD_TITLE ) ).not.toBeInTheDocument();
	} );

	test.each< [ string, Partial< Domain >, Partial< Purchase > | null ] >( [
		[ 'the subscription can still be charged', {}, { expiry_status: 'auto-renewing' } ],
		[ 'the domain already expired', { expired: true }, {} ],
		[
			'the domain with auto-renew off already expired',
			{ auto_renewing: false, expired: true },
			{ ...AUTO_RENEW_OFF, expiry_date: daysFromNow( 30 ) },
		],
		[ 'the user is not the owner', { current_user_is_owner: false }, {} ],
		[
			'the user does not own the domain with auto-renew off',
			{ auto_renewing: false, current_user_is_owner: false },
			{ ...AUTO_RENEW_OFF, expiry_date: daysFromNow( 30 ) },
		],
		[
			'a transfer has auto-renew off',
			{
				auto_renewing: false,
				subtype: { id: DomainSubtype.DOMAIN_TRANSFER, label: 'Domain Transfer' },
			},
			{ ...AUTO_RENEW_OFF, expiry_date: daysFromNow( 30 ) },
		],
		[
			'a connected domain has auto-renew off',
			{
				auto_renewing: false,
				subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
			},
			AUTO_RENEW_OFF,
		],
		[ 'there is no purchase to act on', {}, null ],
	] )( 'shows nothing when %s', async ( _, domain, purchase ) => {
		renderNotice( domain, purchase );

		expect( screen.queryByText( NO_PAYMENT_METHOD_TITLE ) ).not.toBeInTheDocument();
		expect( screen.queryByText( EXPIRED_CARD_TITLE ) ).not.toBeInTheDocument();
		expect( screen.queryByText( AUTO_RENEW_OFF_TITLE ) ).not.toBeInTheDocument();
		expect( screen.queryByText( EXPIRING_SOON_TITLE ) ).not.toBeInTheDocument();
	} );
} );
