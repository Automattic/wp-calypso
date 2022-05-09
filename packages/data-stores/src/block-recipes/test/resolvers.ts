/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */
import { register } from '..';
import { getBlockRecipes } from '../resolvers';

beforeAll( () => {
	register();
} );

describe( 'getBlockRecipes', () => {
	it( 'should dispatch a requestProductsList action and return a receiveProductsList action', async () => {
		const generator = getBlockRecipes();
		const apiResponse = {};

		expect( await generator.next().value ).toEqual( {
			type: 'API_FETCH',
			request: expect.objectContaining( {
				url: 'https://public-api.wordpress.com/wpcom/v2/block-recipes',
			} ),
		} );

		expect( await generator.next( apiResponse ).value ).toEqual( {
			type: 'RECEIVE_BLOCK_RECIPES',
			blockRecipes: {},
		} );

		expect( generator.next().done ).toBe( true );
	} );
} );
