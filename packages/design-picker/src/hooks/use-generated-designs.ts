import { useMemo } from 'react';
import type { Design } from '../types';
import type { BlockRecipe } from '@automattic/data-stores/src/block-recipes/types';

export function useGeneratedDesigns( recipes?: BlockRecipe[] ): Design[] {
	return useMemo( () => {
		if ( ! recipes || ! recipes.length ) {
			return [];
		}

		return recipes.map( ( recipe ) => {
			const { slug, title, stylesheet, pattern_ids } = recipe;

			return {
				slug,
				title,
				recipe: { stylesheet, patternIds: pattern_ids },
				categories: [ { slug, name: title } ],
				is_premium: false,
				features: [],
				template: '',
				theme: '',
			};
		} );
	}, [ recipes ] );
}
