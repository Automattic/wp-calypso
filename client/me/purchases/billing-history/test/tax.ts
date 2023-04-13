/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';
import { renderTransactionAmount, transactionIncludesTax } from '../utils';

const mockTransaction: BillingTransaction = {
	currency: 'USD',
	address: '',
	amount: '',
	amount_integer: 0,
	tax_country_code: '',
	cc_email: '',
	cc_name: '',
	cc_num: '',
	cc_type: '',
	credit: '',
	date: '',
	desc: '',
	icon: '',
	id: '',
	items: [],
	org: '',
	pay_part: '',
	pay_ref: '',
	service: '',
	subtotal: '',
	subtotal_integer: 0,
	support: '',
	tax: '',
	tax_integer: 0,
	url: '',
};

const mockItem: BillingTransactionItem = {
	id: '',
	type: '',
	type_localized: '',
	domain: '',
	site_id: '',
	subtotal: '',
	subtotal_integer: 0,
	tax_integer: 0,
	amount_integer: 0,
	tax: '',
	amount: '',
	raw_subtotal: 0,
	raw_tax: 0,
	raw_amount: 0,
	currency: '',
	licensed_quantity: null,
	new_quantity: null,
	product: '',
	product_slug: '',
	variation: '',
	variation_slug: '',
	months_per_renewal_interval: 0,
	wpcom_product_slug: '',
};

describe( 'transactionIncludesTax', () => {
	test( 'returns true for a transaction with tax', () => {
		const transaction: BillingTransaction = {
			...mockTransaction,
			subtotal: '$36.00',
			tax: '$2.48',
			amount: '$38.48',
			subtotal_integer: 3600,
			tax_integer: 248,
			amount_integer: 3848,
			items: [
				{
					...mockItem,
					raw_tax: 2.48,
					tax_integer: 248,
				},
			],
		};

		expect( transactionIncludesTax( transaction ) ).toBe( true );
	} );

	test( 'returns false for a transaction without tax values', () => {
		const transaction = {
			...mockTransaction,
			subtotal: '$36.00',
			amount: '$38.48',
			subtotal_integer: 3600,
			amount_integer: 3848,
			items: [
				{
					...mockItem,
				},
			],
		};

		expect( transactionIncludesTax( transaction ) ).toBe( false );
	} );

	test( 'returns false for a transaction with zero tax values', () => {
		const transaction = {
			...mockTransaction,
			subtotal: '$36.00',
			tax: '$0.00',
			amount: '$38.48',
			subtotal_integer: 3600,
			amount_integer: 3848,
			items: [
				{
					...mockItem,
					raw_tax: 0,
				},
			],
		};
		expect( transactionIncludesTax( transaction ) ).toBe( false );
	} );

	test( 'returns false for a transaction without zero tax values in another currency', () => {
		const transaction = {
			...mockTransaction,
			currency: 'EUR',
			subtotal: '€36.00',
			tax: '€0.00',
			amount: '€38.48',
			subtotal_integer: 3600,
			amount_integer: 3848,
			items: [
				{
					...mockItem,
					raw_tax: 0,
				},
			],
		};

		expect( transactionIncludesTax( transaction ) ).toBe( false );
	} );
} );

test( 'tax shown if available', () => {
	const transaction = {
		...mockTransaction,
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
		subtotal_integer: 3600,
		tax_integer: 248,
		amount_integer: 3848,
		items: [
			{
				...mockItem,
				raw_tax: 2.48,
				tax_integer: 248,
			},
		],
	};

	render( renderTransactionAmount( transaction, { translate } ) as any );
	expect( screen.getByText( /tax/ ) ).toBeInTheDocument();
} );

test( 'tax includes', () => {
	const transaction = {
		...mockTransaction,
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
		subtotal_integer: 3600,
		tax_integer: 248,
		amount_integer: 3848,
		items: [
			{
				...mockItem,
				raw_tax: 2.48,
				tax_integer: 248,
			},
		],
	};

	render( renderTransactionAmount( transaction, { translate, addingTax: false } ) as any );
	expect( screen.getByText( `(includes ${ transaction.tax } tax)` ) ).toBeInTheDocument();
} );

test( 'tax adding', () => {
	const transaction = {
		...mockTransaction,
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
		subtotal_integer: 3600,
		tax_integer: 248,
		amount_integer: 3848,
		items: [
			{
				...mockItem,
				raw_tax: 2.48,
				tax_integer: 248,
			},
		],
	};

	render( renderTransactionAmount( transaction, { translate, addingTax: true } ) as any );
	expect( screen.getByText( `(+${ transaction.tax } tax)` ) ).toBeInTheDocument();
} );

test( 'tax includes with localized tax name', () => {
	const transaction = {
		...mockTransaction,
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
		tax_country_code: 'GB',
		subtotal_integer: 3600,
		tax_integer: 248,
		amount_integer: 3848,
		items: [
			{
				...mockItem,
				raw_tax: 2.48,
				tax_integer: 248,
			},
		],
	};

	render( renderTransactionAmount( transaction, { translate, addingTax: false } ) as any );
	expect( screen.getByText( `(includes ${ transaction.tax } VAT)` ) ).toBeInTheDocument();
} );

test( 'tax adding with localized tax name', () => {
	const transaction = {
		...mockTransaction,
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
		tax_country_code: 'GB',
		subtotal_integer: 3600,
		tax_integer: 248,
		amount_integer: 3848,
		items: [
			{
				...mockItem,
				raw_tax: 2.48,
				tax_integer: 248,
			},
		],
	};

	render( renderTransactionAmount( transaction, { translate, addingTax: true } ) as any );
	expect( screen.getByText( `(+${ transaction.tax } VAT)` ) ).toBeInTheDocument();
} );

test( 'tax hidden if not available', () => {
	const transaction = {
		...mockTransaction,
		subtotal: '$36.00',
		tax: '$0.00',
		amount: '$36.00',
		subtotal_integer: 3600,
		amount_integer: 3600,
		items: [ { ...mockItem } ],
	};

	expect( renderTransactionAmount( transaction, { translate } ) ).toEqual( '$36' );
} );
