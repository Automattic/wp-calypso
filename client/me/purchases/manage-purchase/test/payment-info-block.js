/**
 * @jest-environment jsdom
 */

/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-title */

import { render, screen } from '@testing-library/react';
import PaymentInfoBlock from '../payment-info-block';

describe( 'PaymentInfoBlock', () => {
	describe.each( [
		[ 'enabled', undefined ],
		[ 'disabled', 'manualRenew' ],
	] )( 'when auto-renew is %s', ( autoRenewStatus, expiryStatus ) => {
		describe( 'when the purchase has credits as the payment method', () => {
			const purchase = { expiryStatus, payment: { type: 'credits' }, isRechargeable: false };

			it( 'renders "Credits"', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'Credits' );
			} );

			it( 'does not render "will not be billed"', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
					'will not be billed'
				);
			} );
		} );

		describe( 'when the purchase has included-with-plan as the payment method', () => {
			const purchase = { expiryStatus: 'included' };

			it( 'renders "Included with plan"', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent(
					'Included with plan'
				);
			} );

			it( 'does not render "will not be billed"', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
					'will not be billed'
				);
			} );
		} );

		describe( 'when the purchase has no payment method', () => {
			const purchase = { expiryStatus, isRechargeable: false, payment: {} };

			it( 'renders "None"', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'None' );
			} );

			it( 'does not render "will not be billed"', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
					'will not be billed'
				);
			} );
		} );

		describe( 'when the purchase a non-rechargable payment method', () => {
			const purchase = { expiryStatus, payment: { type: 'ideal' }, isRechargeable: false };

			it( 'renders "None"', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( 'None' );
			} );

			it( 'does not render "will not be billed"', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
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
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent( '1234' );
			} );

			it( 'renders the credit card logo', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Mastercard' ) ).toBeInTheDocument();
			} );

			it(
				autoRenewStatus === 'enabled'
					? 'does not render "will not be billed"'
					: 'renders "will not be billed"',
				() => {
					render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
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
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
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
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'PayPal' ) ).toBeInTheDocument();
			} );

			it(
				autoRenewStatus === 'enabled'
					? 'does not render "will not be billed"'
					: 'renders "will not be billed"',
				() => {
					render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
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
			render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
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
			render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
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
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent(
					`expiring ${ expiryAsMonthYear }`
				);
			} );

			it( 'renders the placeholder logo', () => {
				render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
				expect( screen.getByLabelText( 'Payment logo' ) ).toBeInTheDocument();
			} );

			it(
				autoRenewStatus === 'enabled'
					? 'does not render "will not be billed"'
					: 'renders "will not be billed"',
				() => {
					render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
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

			it(
				autoRenewStatus === 'enabled'
					? 'renders backup method warning if there is a backup available'
					: 'does not render backup method warning even if there is a backup available',
				() => {
					const mockBackupCard = {
						added: '',
						card: '1234',
						card_type: 'visa',
						email: '',
						expiry: '11/24',
						last_service: '',
						last_used: '',
						mp_ref: '',
						name: '',
						payment_partner: '',
						remember: 'yes',
						stored_details_id: 'mock-stored-id',
						user_id: 'mock-user-id',
						meta: [ { meta_key: 'is_backup', meta_value: 'backup' } ],
					};
					render( <PaymentInfoBlock purchase={ purchase } cards={ [ mockBackupCard ] } /> );
					if ( autoRenewStatus === 'enabled' ) {
						expect( screen.getByLabelText( 'Payment method' ) ).toHaveTextContent(
							'If the renewal fails, a backup payment method may be used.'
						);
					} else {
						expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
							'If the renewal fails, a backup payment method may be used.'
						);
					}
				}
			);

			it( 'does not render the backup method warning if there is no backup available', () => {
				const mockNonBackupCard = {
					added: '',
					card: '1234',
					card_type: 'visa',
					email: '',
					expiry: '11/24',
					last_service: '',
					last_used: '',
					mp_ref: '',
					name: '',
					payment_partner: '',
					remember: 'yes',
					stored_details_id: 'mock-stored-id',
					user_id: 'mock-user-id',
					meta: [],
				};
				render( <PaymentInfoBlock purchase={ purchase } cards={ [ mockNonBackupCard ] } /> );
				expect( screen.getByLabelText( 'Payment method' ) ).not.toHaveTextContent(
					'If the renewal fails, a backup payment method may be used.'
				);
			} );
		} );
	} );
	it( 'shows warning if auto-renew is enabled without a payment method', () => {
		const purchase = {
			isAutoRenewEnabled: 'true',
		};
		render( <PaymentInfoBlock purchase={ purchase } cards={ [] } /> );
		expect( screen.getByText( 'No payment method' ) ).toBeInTheDocument();
	} );
} );
