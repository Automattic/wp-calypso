/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import { renderTransactionAmount, transactionIncludesTax } from '../utils';
import { createReduxStore } from 'state';

const translate = x => x;

describe( 'transactionIncludesTax', () => {
	test( 'returns true for a transaction with tax', () => {
		const transaction = {
			subtotal: '$36.00',
			tax: '$2.48',
			amount: '$38.48',
			items: [
				{
					raw_tax: 2.48,
				},
			],
		};

		expect( transactionIncludesTax( transaction ) ).toBe( true );
	} );

	test( 'returns false for a transaction without tax values', () => {
		const transaction = {
			subtotal: '$36.00',
			amount: '$38.48',
			items: [ {} ],
		};

		expect( transactionIncludesTax( transaction ) ).toBe( false );
	} );

	test( 'returns false for a transaction with zero tax values', () => {
		const transaction = {
			subtotal: '$36.00',
			tax: '$0.00',
			amount: '$38.48',
			items: [
				{
					raw_tax: 0,
				},
			],
		};
		expect( transactionIncludesTax( transaction ) ).toBe( false );
	} );

	test( 'returns false for a transaction without zero tax values in another currency', () => {
		const transaction = {
			subtotal: '€36.00',
			tax: '€0.00',
			amount: '€38.48',
			items: [
				{
					raw_tax: 0,
				},
			],
		};

		expect( transactionIncludesTax( transaction ) ).toBe( false );
	} );
} );

test( 'tax shown if available', () => {
	const transaction = {
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
		items: [
			{
				raw_tax: 2.48,
			},
		],
	};

	const wrapper = mount( renderTransactionAmount( transaction, { translate } ) );
	expect( wrapper.last().text() ).toContain( 'tax' );
} );

test( 'tax includes', () => {
	const transaction = {
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
		items: [
			{
				raw_tax: 2.48,
			},
		],
	};

	const wrapper = mount( renderTransactionAmount( transaction, { translate, addingTax: false } ) );
	expect( wrapper.last().text() ).toEqual( '(includes %(taxAmount)s tax)' );
} );

test( 'tax adding', () => {
	const transaction = {
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
		items: [
			{
				raw_tax: 2.48,
			},
		],
	};

	const wrapper = mount( renderTransactionAmount( transaction, { translate, addingTax: true } ) );
	expect( wrapper.last().text() ).toEqual( '(+%(taxAmount)s tax)' );
} );

test( 'tax hidden if not available', () => {
	const transaction = {
		subtotal: '$36.00',
		tax: '$0.00',
		amount: '$36.00',
		items: [ {} ],
	};

	expect( renderTransactionAmount( transaction, { translate } ) ).toEqual( '$36.00' );
} );

test( 'tax applicable shown if upcoming', () => {
	const upcoming = { amount: '€38.48' };

	// Provider redux store context required by dep on connected popover
	const store = createReduxStore();
	const wrapper = mount(
		<Provider store={ store }>
			{ renderTransactionAmount( upcoming, { translate, addingTax: true, estimated: true } ) }
		</Provider>
	);
	expect( wrapper.last().text() ).toEqual( '€38.48(+ applicable tax)' );
} );
