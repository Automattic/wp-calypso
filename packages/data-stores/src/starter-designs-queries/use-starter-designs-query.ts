import { stringify } from 'qs';
import { useQuery, UseQueryResult, QueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type {
	StarterDesignsGenerated,
	StarterDesignsGeneratedQueryParams,
	AllStarterDesigns,
} from './types';
import type { Category, Design, DesignRecipe } from '@automattic/design-picker/src/types';

interface Options extends QueryOptions< AllStarterDesignsResponse, unknown > {
	enabled?: boolean;
}

interface AllStarterDesignsResponse {
	generated: { designs: StarterDesignsGenerated[] };
	static: { designs: StarterDesignStatic[] };
}

interface StarterDesignStatic {
	recipe: DesignRecipe;
	slug: string;
	title: string;
	categories: Category[];
	price?: string;
}

export function useStarterDesignsQuery(
	queryParams: StarterDesignsGeneratedQueryParams,
	queryOptions: Options = {}
): UseQueryResult< AllStarterDesigns > {
	return useQuery( [ 'starter-designs', queryParams ], () => fetchStarterDesigns( queryParams ), {
		select: ( response: AllStarterDesignsResponse ) => {
			return {
				generated: {
					designs: response.generated?.designs?.map( apiStarterDesignsGeneratedToDesign ),
				},
				static: {
					designs: response.static?.designs?.map( apiStarterDesignsStaticToDesign ),
				},
			} as AllStarterDesigns;
		},
		refetchOnMount: 'always',
		staleTime: Infinity,
		...queryOptions,
	} );
}

function fetchStarterDesigns(
	queryParams: StarterDesignsGeneratedQueryParams
): Promise< AllStarterDesignsResponse > {
	return wpcomRequest< AllStarterDesignsResponse >( {
		apiNamespace: 'wpcom/v2',
		path: '/starter-designs',
		query: stringify( queryParams ),
	} );
}

function apiStarterDesignsStaticToDesign( design: StarterDesignStatic ): Design {
	const { slug, title, recipe, categories, price } = design;
	const is_premium =
		( design.recipe.stylesheet && design.recipe.stylesheet.startsWith( 'premium/' ) ) || false;

	return {
		slug,
		title,
		recipe,
		categories,
		is_premium,
		price,
		design_type: is_premium ? 'premium' : 'standard',
		// Deprecated; used for /start flow
		features: [],
		template: '',
		theme: '',
	};
}

function apiStarterDesignsGeneratedToDesign( design: StarterDesignsGenerated ): Design {
	const { slug, title, recipe } = design;

	return {
		slug,
		title,
		recipe,
		is_premium: false,
		categories: [],
		features: [],
		template: '',
		theme: '',
		design_type: 'vertical',
	};
}
