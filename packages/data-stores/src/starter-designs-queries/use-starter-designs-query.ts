import { stringify } from 'qs';
import { useQuery, UseQueryResult, QueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { isThemeVerticalizable } from './utils';
import type { StarterDesigns } from './types';
import type {
	Category,
	Design,
	DesignRecipe,
	StyleVariation,
} from '@automattic/design-picker/src/types';

interface StarterDesignsQueryParams {
	vertical_id: string;
	intent: string;
	seed?: string;
	_locale: string;
}

interface Options extends QueryOptions< StarterDesignsResponse, unknown > {
	enabled?: boolean;
	select?: ( response: StarterDesigns ) => StarterDesigns;
}

interface StarterDesignsResponse {
	generated: { designs: GeneratedDesign[] };
	static: { designs: StaticDesign[] };
}

interface StaticDesign {
	recipe: DesignRecipe;
	slug: string;
	title: string;
	description: string;
	categories: Category[];
	price?: string;
	style_variations?: StyleVariation[];
}

interface GeneratedDesign {
	slug: string;
	title: string;
	recipe: DesignRecipe;
}

export function useStarterDesignsQuery(
	queryParams: StarterDesignsQueryParams,
	{ select, ...queryOptions }: Options = {}
): UseQueryResult< StarterDesigns > {
	return useQuery( [ 'starter-designs', queryParams ], () => fetchStarterDesigns( queryParams ), {
		select: ( response: StarterDesignsResponse ) => {
			const allDesigns = {
				generated: {
					designs: response.generated?.designs?.map( apiStarterDesignsGeneratedToDesign ),
				},
				static: {
					designs: response.static?.designs?.map( apiStarterDesignsStaticToDesign ),
				},
			};

			return select ? select( allDesigns ) : allDesigns;
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
	const { slug, title, description, recipe, categories, price, style_variations } = design;
	const is_premium =
		( design.recipe.stylesheet && design.recipe.stylesheet.startsWith( 'premium/' ) ) || false;

	return {
		slug,
		title,
		description,
		recipe,
		categories,
		is_premium,
		price,
		design_type: is_premium ? 'premium' : 'standard',
		style_variations,
		verticalizable: isThemeVerticalizable( recipe.stylesheet ),
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
		verticalizable: true,
	};
}
