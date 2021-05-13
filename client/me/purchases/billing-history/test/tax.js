/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import { renderTransactionAmount, transactionIncludesTax } from '../utils';

const translate = ( x ) => x;

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
