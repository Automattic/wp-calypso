/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */
import { register } from '..';
import { getProductsList } from '../resolvers';

beforeAll( () => {
	register();
} );

describe( 'getProductsList', () => {
	it( 'should dispatch a requestProductsList action and return a receiveProductsList action', async () => {
		const generator = getProductsList( null );
		const apiResponse = {};

		expect( await generator.next().value ).toEqual( {
			type: 'PRODUCTS_LIST_REQUEST',
		} );

		expect( await generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				path: '/products',
				apiVersion: '1.1',
			} ),
		} );

		expect( await generator.next( apiResponse ).value ).toEqual( {
			type: 'PRODUCTS_LIST_RECEIVE',
			productsList: {},
			productsListType: null,
		} );

		expect( generator.next().done ).toBe( true );
	} );
} );
