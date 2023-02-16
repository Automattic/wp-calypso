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
}

interface Options extends QueryOptions< StarterDesignsResponse, unknown > {
	enabled?: boolean;
	select?: ( response: StarterDesigns ) => StarterDesigns;
	shouldLimitGlobalStyles?: boolean;
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
	style_variation_slug: string | null;
}

interface GeneratedDesign {
	slug: string;
	title: string;
	recipe: DesignRecipe;
	verticalizable: boolean;
}

export function useStarterDesignsQuery(
	queryParams: StarterDesignsQueryParams,
	{ select, shouldLimitGlobalStyles, ...queryOptions }: Options = {}
): UseQueryResult< StarterDesigns > {
	return useQuery( [ 'starter-designs', queryParams ], () => fetchStarterDesigns( queryParams ), {
		select: ( response: StarterDesignsResponse ) => {
			const allDesigns = {
				generated: {
					designs: response.generated?.designs?.map( apiStarterDesignsGeneratedToDesign ),
				},
				static: {
					designs: response.static?.designs?.map( ( design ) =>
						apiStarterDesignsStaticToDesign( design, shouldLimitGlobalStyles )
					),
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

function apiStarterDesignsStaticToDesign(
	design: StaticDesign,
	shouldLimitGlobalStyles?: boolean
): Design {
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
		is_virtual,
		style_variation_slug,
	} = design;
	const is_premium =
		( design.recipe.stylesheet && design.recipe.stylesheet.startsWith( 'premium/' ) ) ||
		( shouldLimitGlobalStyles && is_virtual && !! style_variation_slug ) ||
		false;

	const is_bundled_with_woo_commerce = ( design.software_sets || [] ).some(
		( { slug } ) => slug === 'woo-on-plans'
	);

	const style_variation =
		is_virtual && style_variation_slug
			? style_variations?.find( ( { slug } ) => slug === style_variation_slug )
			: null;

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
		is_virtual,
		style_variation,
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
