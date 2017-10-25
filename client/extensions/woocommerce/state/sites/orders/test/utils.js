/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import existingOrder from './fixtures/order';
import { removeTemporaryIds } from '../utils';

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
