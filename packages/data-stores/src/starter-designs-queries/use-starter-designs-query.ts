import { stringify } from 'qs';
import { useQuery, UseQueryResult, QueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { StarterDesigns } from './types';
import type { Category, Design, DesignRecipe } from '@automattic/design-picker/src/types';

interface StarterDesignsQueryParams {
	vertical_id: string;
	intent: string;
	seed?: string;
	_locale: string;
}

interface Options extends QueryOptions< StarterDesignsResponse, unknown > {
	enabled?: boolean;
}

interface StarterDesignsResponse {
	generated: { designs: GeneratedDesign[] };
	static: { designs: StaticDesign[] };
}

interface StaticDesign {
	recipe: DesignRecipe;
	slug: string;
	title: string;
	categories: Category[];
	price?: string;
}

interface GeneratedDesign {
	slug: string;
	title: string;
	recipe: DesignRecipe;
}

export function useStarterDesignsQuery(
	queryParams: StarterDesignsQueryParams,
	queryOptions: Options = {}
): UseQueryResult< StarterDesigns > {
	return useQuery( [ 'starter-designs', queryParams ], () => fetchStarterDesigns( queryParams ), {
		select: ( response: StarterDesignsResponse ) => {
			return {
				generated: {
					designs: response.generated?.designs?.map( apiStarterDesignsGeneratedToDesign ),
				},
				static: {
					designs: response.static?.designs?.map( apiStarterDesignsStaticToDesign ),
				},
			} as StarterDesigns;
		},
		refetchOnMount: 'always',
		staleTime: Infinity,
		...queryOptions,
	} );
}

function fetchStarterDesigns(
	queryParams: StarterDesignsQueryParams
): Promise< StarterDesignsResponse > {
	return wpcomRequest< StarterDesignsResponse >( {
		apiNamespace: 'wpcom/v2',
		path: '/starter-designs',
		query: stringify( queryParams ),
	} );
}

function apiStarterDesignsStaticToDesign( design: StaticDesign ): Design {
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

function apiStarterDesignsGeneratedToDesign( design: GeneratedDesign ): Design {
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
