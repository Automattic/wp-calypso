import { useQuery, UseQueryResult } from 'react-query';
import wpcom from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports
import type { BlockRecipe, Design } from '../types';

export function useGeneratedDesignsQuery(): UseQueryResult< Design[] > {
	return useQuery( [ 'generated-designs' ], () => fetchBlockRecipes(), {
		select: ( response ) => response.map( apiBlockRecipeToDesign ),
		enabled: true,
		staleTime: Infinity,
	} );
}

function fetchBlockRecipes(): Promise< BlockRecipe[] > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/block-recipes',
	} );
}

function apiBlockRecipeToDesign( recipe: BlockRecipe ): Design {
	const { slug, title, stylesheet, pattern_ids } = recipe;

	return {
		slug,
		title,
		recipe: { stylesheet, patternIds: pattern_ids },
		is_premium: false,
		categories: [],
		features: [],
		template: '',
		theme: '',
	};
}
