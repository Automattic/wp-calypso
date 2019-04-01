/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import { renderTransactionAmount } from '../utils';
import config from 'config';

jest.mock( 'config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn();
	return mock;
} );

const translate = x => x;

test( 'tax shown if available', () => {
	config.isEnabled.mockImplementation( flag => flag === 'show-tax' );

	const transaction = {
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
	};

	const wrapper = mount( renderTransactionAmount( transaction, { translate } ) );
	expect( wrapper.last().text() ).toContain( 'tax' );
} );

test( 'tax includes', () => {
	const transaction = {
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
	};

	const wrapper = mount( renderTransactionAmount( transaction, { translate, addingTax: false } ) );
	expect( wrapper.last().text() ).toEqual( '(includes %(taxAmount)s tax)' );
} );

test( 'tax adding', () => {
	const transaction = {
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
	};

	const wrapper = mount( renderTransactionAmount( transaction, { translate, addingTax: true } ) );
	expect( wrapper.last().text() ).toEqual( '(+%(taxAmount)s tax)' );
} );

test( 'tax hidden if not available', () => {
	config.isEnabled.mockImplementation( flag => flag === 'show-tax' );

	const transaction = {
		subtotal: '$36.00',
		tax: '$0.00',
		amount: '$36.00',
	};

	expect( renderTransactionAmount( transaction, { translate } ) ).toEqual( '$36.00' );
} );

test( 'respects show-tax config flag', () => {
	config.isEnabled.mockImplementation( () => false );

	const transaction = {
		subtotal: '$36.00',
		tax: '$2.48',
		amount: '$38.48',
	};

	expect( renderTransactionAmount( transaction, { translate } ) ).toEqual( '$38.48' );
} );
