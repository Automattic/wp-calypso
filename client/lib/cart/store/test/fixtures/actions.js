/**
 */

/**
 * External dependencies
 */
import { mapValues } from 'lodash';

export const payments = {
	stored: {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Stored',
		storedCard: {
			user_id: '12345678',
			stored_details_id: '2345678',
			expiry: '2019-08-31',
			card: '5678',
			card_type: 'visa',
			mp_ref: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			payment_partner: 'stripe_ie',
			name: 'Eunice User',
			email: '',
			remember: '1',
			meta: [
				{
					stored_details_id: '8888888',
					meta_key: 'country_code',
					meta_value: 'US',
				},
				{
					stored_details_id: '8888888',
					meta_key: 'payment_partner_reference',
					meta_value: 'stripe_ie:cus_DDDDDDDDDDDDDD',
				},
				{
					stored_details_id: '8888888',
					meta_key: 'payment_partner_source_id',
					meta_value: 'card_KKKKKKKKKKKKKKKKKKKKKKKK',
				},
				{
					stored_details_id: '8888888',
					meta_key: 'source',
					meta_value: null,
				},
				{
					stored_details_id: '8888888',
					meta_key: 'original_stored_details_id',
					meta_value: null,
				},
				{
					stored_details_id: '8888888',
					meta_key: 'card_zip',
					meta_value: '90001',
				},
				{
					stored_details_id: '8888888',
					meta_key: 'card_iin',
					meta_value: '450949',
				},
			],
			added: '2018-09-05 07:38:13',
			last_used: '2018-09-05 07:45:32',
			last_service: 'wordpress-com',
		},
	},
	creditCard: {
		paymentMethod: 'WPCOM_Billing_Stripe_Payment_Method',
		newCardDetails: {
			country: 'US1',
			name: 'Albert A. User',
			'postal-code': '90014',
			cvv: '987',
			'expiration-date': '12/99',
			number: '1234567890123452',
			brand: null,
		},
	},
	credits: {
		paymentMethod: 'WPCOM_Billing_WPCOM',
	},
	unrecognized: {
		paymentMethod: 'Not_A_Real_Payment_Method',
		newCardDetails: {
			country: 'US',
			name: 'Albert A. Unknown',
			'postal-code': '98765',
			cvv: '777',
			'expiration-date': '11/77',
			number: '5678901234521234',
			brand: null,
		},
	},
	newCardNoPostalCode: {
		paymentMethod: 'WPCOM_Billing_Stripe_Payment_Method',
		newCardDetails: {
			country: 'AI',
			name: 'Albert A. User',
			cvv: '987',
			'expiration-date': '12/99',
			number: '1234567890123452',
			brand: null,
		},
	},
	newCardNoCountryCode: {
		paymentMethod: 'WPCOM_Billing_Stripe_Payment_Method',
		newCardDetails: {
			name: 'Albert A. User',
			'postal-code': '90314',
			cvv: '987',
			'expiration-date': '12/99',
			number: '1234567890123452',
			brand: null,
		},
	},
};

export const transactionPaymentSetActions = mapValues( payments, ( payment ) => ( {
	type: 'TRANSACTION_PAYMENT_SET',
	payment,
} ) );

export const paymentActionLocations = [
	[ 'stored', { postalCode: '90001', countryCode: 'US' } ],
	[ 'creditCard', { postalCode: '90014', countryCode: 'US1' } ],
	[ 'credits', { postalCode: null, countryCode: null } ],
	[ 'unrecognized', { postalCode: null, countryCode: null } ],
];
