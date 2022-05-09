import { apiFetch } from '@wordpress/data-controls';
import { receiveBlockRecipes } from './actions';
import type { BlockRecipe } from './types';

export function* getBlockRecipes() {
	const blockRecipes: BlockRecipe[] = yield apiFetch( {
		url: `https://public-api.wordpress.com/wpcom/v2/block-recipes`,
	} );

	return receiveBlockRecipes( blockRecipes );
}
