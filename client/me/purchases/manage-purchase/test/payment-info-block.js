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
		describe( 'when the purchase has credits as the payment method', () => {
			const purchase = { expiryStatus, payment: { type: 'credits' }, isRechargeable: false };

			it( 'renders "Credits"', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'Credits' );
			} );

			it( 'does not render "will not be billed"', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
					'will not be billed'
				);
			} );
		} );

		describe( 'when the purchase has included-with-plan as the payment method', () => {
			const purchase = { expiryStatus: 'included' };

			it( 'renders "Included with plan"', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent(
					'Included with plan'
				);
			} );

			it( 'does not render "will not be billed"', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
					'will not be billed'
				);
			} );
		} );

		describe( 'when the purchase has no payment method', () => {
			const purchase = { expiryStatus, isRechargeable: false, payment: {} };

			it( 'renders "None"', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'None' );
			} );

			it( 'does not render "will not be billed"', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
					'will not be billed'
				);
			} );
		} );

		describe( 'when the purchase a non-rechargable payment method', () => {
			const purchase = { expiryStatus, payment: { type: 'ideal' }, isRechargeable: false };

			it( 'renders "None"', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'None' );
			} );

			it( 'does not render "will not be billed"', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
					'will not be billed'
				);
			} );
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
				isRechargeable: true,
			};

			it( 'renders the credit card last4', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( '1234' );
			} );

			it( 'renders the credit card logo', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'Mastercard' ) ).toBeInTheDocument();
			} );

			it(
				autoRenewStatus === 'enabled'
					? 'does not render "will not be billed"'
					: 'renders "will not be billed"',
				() => {
					render( <PaymentInfoBlock purchase={ purchase } /> );
					if ( expiryStatus === 'manualRenew' ) {
						expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent(
							'will not be billed'
						);
					} else {
						expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
							'will not be billed'
						);
					}
				}
			);
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
					isRechargeable: true,
				};
				render( <PaymentInfoBlock purchase={ purchase } /> );
				if ( expiryStatus === 'manualRenew' ) {
					expect( screen.getByLabelText( 'Mastercard' ) ).toHaveClass( 'disabled' );
				} else {
					expect( screen.getByLabelText( 'Mastercard' ) ).not.toHaveClass( 'disabled' );
				}
			}
		);

		describe( 'when the purchase has PayPal as the payment method', () => {
			const purchase = {
				expiryStatus,
				payment: {
					type: 'paypal',
				},
				isRechargeable: true,
			};

			it( 'renders PayPal logo', () => {
				render( <PaymentInfoBlock purchase={ purchase } /> );
				expect( screen.getByLabelText( 'PayPal' ) ).toBeInTheDocument();
			} );

			it(
				autoRenewStatus === 'enabled'
					? 'does not render "will not be billed"'
					: 'renders "will not be billed"',
				() => {
					render( <PaymentInfoBlock purchase={ purchase } /> );
					if ( expiryStatus === 'manualRenew' ) {
						expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent(
							'will not be billed'
						);
					} else {
						expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
							'will not be billed'
						);
					}
				}
			);
		} );

		it( 'renders the card when the purchase is expired and has a credit card as the payment method', () => {
			const expiryDate = new Date();
			expiryDate.setDate( expiryDate.getDate() - 365 );
			const purchase = {
				expiryStatus: 'expired',
				payment: {
					type: 'credit_card',
					creditCard: { number: '1234', expiryDate, type: 'mastercard' },
				},
				isRechargeable: true,
			};
			render( <PaymentInfoBlock purchase={ purchase } /> );
			expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( '1234' );
		} );

		it( 'renders the card when the purchase has nearly expired and has a credit card as the payment method', () => {
			const expiryDate = new Date();
			expiryDate.setDate( expiryDate.getDate() - 365 );
			const purchase = {
				expiryStatus: 'expiring',
				payment: {
					type: 'credit_card',
					creditCard: { number: '1234', expiryDate, type: 'mastercard' },
				},
				isRechargeable: true,
			};
			render( <PaymentInfoBlock purchase={ purchase } /> );
			expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( '1234' );
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
				isRechargeable: true,
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

			it(
				autoRenewStatus === 'enabled'
					? 'does not render "will not be billed"'
					: 'renders "will not be billed"',
				() => {
					render( <PaymentInfoBlock purchase={ purchase } /> );
					if ( expiryStatus === 'manualRenew' ) {
						expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent(
							'will not be billed'
						);
					} else {
						expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
							'will not be billed'
						);
					}
				}
			);
		} );
	} );
} );
