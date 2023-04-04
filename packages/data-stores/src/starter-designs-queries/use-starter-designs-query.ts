import { stringify } from 'qs';
import { useQuery, UseQueryResult, QueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { StarterDesigns } from './types';
import type {
	Category,
	Design,
	DesignRecipe,
	SoftwareSet,
	StyleVariation,
} from '@automattic/design-picker/src/types';

interface StarterDesignsQueryParams {
	vertical_id: string;
	intent: string;
	seed?: string;
	_locale: string;
	include_virtual_designs?: boolean;
	include_pattern_virtual_designs?: boolean;
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
	slug: string;
	title: string;
	description: string;
	recipe: DesignRecipe;
	verticalizable: boolean;
	categories: Category[];
	price?: string;
	style_variations?: StyleVariation[];
	software_sets?: SoftwareSet[];
	is_virtual: boolean;
}

interface GeneratedDesign {
	slug: string;
	title: string;
	recipe: DesignRecipe;
	verticalizable: boolean;
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
	const {
		slug,
		title,
		description,
		recipe,
		verticalizable,
		categories,
		price,
		style_variations,
		software_sets,
	} = design;
	const is_premium =
		( design.recipe.stylesheet && design.recipe.stylesheet.startsWith( 'premium/' ) ) || false;

	const is_bundled_with_woo_commerce = ( design.software_sets || [] ).some(
		( { slug } ) => slug === 'woo-on-plans'
	);

	return {
		slug,
		title,
		description,
		recipe,
		verticalizable,
		categories,
		is_premium,
		is_bundled_with_woo_commerce,
		price,
		software_sets,
		design_type: is_premium ? 'premium' : 'standard',
		style_variations,
		is_virtual: design.is_virtual && !! design.recipe?.pattern_ids?.length,
		// Deprecated; used for /start flow
		features: [],
		template: '',
		theme: '',
	};
}

function apiStarterDesignsGeneratedToDesign( design: GeneratedDesign ): Design {
	const { slug, title, recipe, verticalizable } = design;

	return {
		slug,
		title,
		recipe,
		verticalizable,
		is_premium: false,
		categories: [],
		features: [],
		template: '',
		theme: '',
		design_type: 'vertical',
	};
}
