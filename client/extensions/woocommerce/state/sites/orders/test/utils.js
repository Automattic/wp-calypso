/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import existingOrder from './fixtures/order';
import { removeTemporaryIds, transformOrderForApi } from '../utils';

describe( 'removeTemporaryIds', () => {
	test( 'should return the same order when there are no temporary IDs', () => {
		expect( removeTemporaryIds( existingOrder ) ).to.eql( existingOrder );
	} );

	test( 'should remove the temporary ID, but leave both line items', () => {
		const order = deepFreeze( {
			line_items: [
				{
					id: 1,
					name: 'Coffee',
					price: 5,
				},
				{
					id: 'product_2',
					name: 'Mug',
					price: 15,
				},
			],
		} );
		const newOrder = removeTemporaryIds( order );
		expect( newOrder.line_items ).to.eql( [
			{
				id: 1,
				name: 'Coffee',
				price: 5,
			},
			{
				name: 'Mug',
				price: 15,
			},
		] );
	} );

	test( 'should remove the temporary ID, but leave the fee lines', () => {
		const order = deepFreeze( {
			fee_lines: [
				{
					id: 'fee_1',
					name: 'Something extra',
					total: 10,
				},
			],
		} );
		const newOrder = removeTemporaryIds( order );
		expect( newOrder.fee_lines ).to.eql( [
			{
				name: 'Something extra',
				total: 10,
			},
		] );
	} );

	test( 'should work when there are line_items and fee_lines', () => {
		const order = deepFreeze( {
			line_items: [
				{
					id: 1,
					name: 'Coffee',
					price: 5,
				},
				{
					id: 'product_2',
					name: 'Mug',
					price: 15,
				},
			],
			fee_lines: [
				{
					id: 'fee_1',
					name: 'Something extra',
					total: 10,
				},
			],
		} );
		const newOrder = removeTemporaryIds( order );
		expect( newOrder.line_items ).to.eql( [
			{
				id: 1,
				name: 'Coffee',
				price: 5,
			},
			{
				name: 'Mug',
				price: 15,
			},
		] );
		expect( newOrder.fee_lines ).to.eql( [
			{
				name: 'Something extra',
				total: 10,
			},
		] );
	} );
} );

describe( 'transformOrderForApi', () => {
	test( 'should return a full order object', () => {
		expect( transformOrderForApi( existingOrder ) ).to.eql( existingOrder );
	} );

	test( 'should convert totals to strings', () => {
		const order = { total: 11.5, total_tax: 0 };
		expect( transformOrderForApi( order ) ).to.eql( { total: '11.50', total_tax: '0.00' } );
	} );

	test( 'should dive into line_items to convert prices', () => {
		const order = {
			line_items: [ { name: 'Example', subtotal: 12.5, quantity: '1', price: '12.5' } ],
		};
		const apiOrder = transformOrderForApi( order );
		expect( apiOrder.line_items[ 0 ].name ).to.eql( 'Example' );
		expect( apiOrder.line_items[ 0 ].subtotal ).to.eql( '12.50' );
		expect( apiOrder.line_items[ 0 ].quantity ).to.eql( 1 );
		expect( apiOrder.line_items[ 0 ].price ).to.eql( 12.5 );
	} );

	test( 'should dive into shipping_lines to convert prices', () => {
		const order = {
			shipping_lines: [ { method_title: 'USPS', total: 5 } ],
		};
		const apiOrder = transformOrderForApi( order );
		expect( apiOrder.shipping_lines[ 0 ].method_title ).to.eql( 'USPS' );
		expect( apiOrder.shipping_lines[ 0 ].total ).to.eql( '5.00' );
	} );

	test( 'should dive into fee_lines to convert prices', () => {
		const order = {
			fee_lines: [ { name: 'Fee', total: 5 } ],
		};
		const apiOrder = transformOrderForApi( order );
		expect( apiOrder.fee_lines[ 0 ].name ).to.eql( 'Fee' );
		expect( apiOrder.fee_lines[ 0 ].total ).to.eql( '5.00' );
	} );

	test( 'should dive into coupon_lines to convert prices', () => {
		const order = {
			coupon_lines: [ { code: 'new-10-off', discount: 10 } ],
		};
		const apiOrder = transformOrderForApi( order );
		expect( apiOrder.coupon_lines[ 0 ].code ).to.eql( 'new-10-off' );
		expect( apiOrder.coupon_lines[ 0 ].discount ).to.eql( '10.00' );
	} );

	test( 'should dive into refunds to convert prices', () => {
		const order = {
			refunds: [ { reason: 'Example reason', total: 25 } ],
		};
		const apiOrder = transformOrderForApi( order );
		expect( apiOrder.refunds[ 0 ].reason ).to.eql( 'Example reason' );
		expect( apiOrder.refunds[ 0 ].total ).to.eql( '25.00' );
	} );
} );
