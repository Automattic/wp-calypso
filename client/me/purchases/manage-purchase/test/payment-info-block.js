/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
import PaymentInfoBlock from '../payment-info-block';

describe( 'PaymentInfoBlock', () => {
	describe.each( [
		[ 'enabled', undefined ],
		[ 'disabled', 'manualRenew' ],
	] )( 'when auto-renew is %s', ( autoRenewStatus, expiryStatus ) => {
		it( 'renders "Credits" when the purchase was paid with credits', () => {
			const purchase = { expiryStatus, payment: { type: 'credits' } };
			render( <PaymentInfoBlock purchase={ purchase } /> );
			expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'Credits' );
		} );

		it( 'renders "Included with plan" when the purchase is bundled', () => {
			const purchase = { expiryStatus: 'included' };
			render( <PaymentInfoBlock purchase={ purchase } /> );
			expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'Included with plan' );
		} );

		it( 'renders "None" when the purchase has no payment method', () => {
			const purchase = {};
			render( <PaymentInfoBlock purchase={ purchase } /> );
			expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'None' );
		} );

		describe( 'when the purchase has a credit card as the payment method', () => {
			const expiryDate = new Date();
			expiryDate.setDate( expiryDate.getDate() + 365 );
			const purchase = {
				expiryStatus,
				payment: {
					type: 'credit_card',
					creditCard: { number: '1234', expiryDate, type: 'mastercard' },
				},
			};

			it( 'renders the credit card last4', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( '1234' );
			} );

			it( 'renders the credit card logo', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Mastercard' ) ).toBeInTheDocument();
			} );
		} );

		it(
			autoRenewStatus === 'enabled'
				? 'does not render disabled payment logo'
				: 'renders disabled payment logo',
			() => {
				const expiryDate = new Date();
				expiryDate.setDate( expiryDate.getDate() + 365 );
				const purchase = {
					expiryStatus,
					payment: {
						type: 'credit_card',
						creditCard: { number: '1234', expiryDate, type: 'mastercard' },
					},
				};
				render( <PaymentInfoBlock purchase={ purchase } /> );
				if ( expiryStatus === 'manualRenew' ) {
					expect( screen.getByLabelText( 'Mastercard' ) ).toHaveClass( 'disabled' );
				} else {
					expect( screen.getByLabelText( 'Mastercard' ) ).not.toHaveClass( 'disabled' );
				}
			}
		);

		it( 'renders PayPal logo when the purchase has PayPal as the payment method', () => {
			const purchase = {
				expiryStatus,
				payment: {
					type: 'paypal',
				},
			};
			render( <PaymentInfoBlock purchase={ purchase } /> );
			expect( screen.getByLabelText( 'PayPal' ) ).toBeInTheDocument();
		} );

		it( 'renders "None" when the purchase has an expired credit card as the payment method', () => {
			const expiryDate = new Date();
			expiryDate.setDate( expiryDate.getDate() - 365 );
			const purchase = {
				expiryStatus: 'expired',
				payment: {
					type: 'credit_card',
					creditCard: { number: '1234', expiryDate, type: 'mastercard' },
				},
			};
			render( <PaymentInfoBlock purchase={ purchase } /> );
			expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'None' );
		} );

		it( 'renders "None" when the purchase has an nearly-expiring credit card as the payment method', () => {
			const expiryDate = new Date();
			expiryDate.setDate( expiryDate.getDate() - 365 );
			const purchase = {
				expiryStatus: 'expiring',
				payment: {
					type: 'credit_card',
					creditCard: { number: '1234', expiryDate, type: 'mastercard' },
				},
			};
			render( <PaymentInfoBlock purchase={ purchase } /> );
			expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'None' );
		} );

		describe( 'when the purchase has PayPal Direct as the payment method', () => {
			const expiryDate = new Date();
			expiryDate.setDate( expiryDate.getDate() + 365 );
			const purchase = {
				expiryStatus,
				payment: {
					type: 'paypal_direct',
					expiryDate,
				},
			};

			it( 'renders the expiration date', () => {
				const month = expiryDate.toLocaleString( 'default', { month: 'long' } );
				const expiryAsMonthYear = `${ month } ${ expiryDate.getFullYear() }`;
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent(
					`expiring ${ expiryAsMonthYear }`
				);
			} );

			it( 'renders the placeholder logo', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment logo' ) ).toBeInTheDocument();
			} );
		} );
	} );
} );
