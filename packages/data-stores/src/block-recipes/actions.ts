import type { BlockRecipe } from './types';

export const receiveBlockRecipes = ( blockRecipes: BlockRecipe[] ) => ( {
	type: 'RECEIVE_BLOCK_RECIPES' as const,
	blockRecipes,
} );

export type Action = ReturnType< typeof receiveBlockRecipes >;
