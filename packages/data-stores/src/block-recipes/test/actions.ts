import { receiveBlockRecipes } from '../actions';
import { BlockRecipe } from '../types';

describe( 'actions', () => {
	it( 'should return RECEIVE_BLOCK_RECIPES action', () => {
		const testBlockRecipes = [
			{
				id: 3,
				slug: 'blog',
				title: 'Blog',
				stylesheet: 'pub/meraki',
				pattern_ids: [ 1243, 2118, 2266, 2121, 1812 ],
				modified_date: '2022-04-29 17:48:22',
			},
		] as BlockRecipe[];

		const action = {
			type: 'RECEIVE_BLOCK_RECIPES',
			blockRecipes: testBlockRecipes,
		};

		expect( receiveBlockRecipes( testBlockRecipes ) ).toEqual( action );
	} );
} );
