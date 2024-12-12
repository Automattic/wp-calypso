import { useQuery, UseQueryResult, QueryOptions } from '@tanstack/react-query';
import { stringify } from 'qs';
import wpcomRequest from 'wpcom-proxy-request';
import type { StarterDesigns } from './types';
import type {
	Category,
	Design,
	DesignRecipe,
	SoftwareSet,
	StyleVariation,
	PreviewData,
	DesignType,
} from '@automattic/design-picker/src/types';

interface StarterDesignsQueryParams {
	seed?: string;
	goals?: string[];
	_locale: string;
}

interface Options extends QueryOptions< StarterDesignsResponse > {
	enabled?: boolean;
	select?: ( response: StarterDesigns ) => StarterDesigns;
}

interface StarterDesignsResponse {
	filters: { subject: Record< string, Category > };
	static: { designs: StarterDesign[] };
	recommendation: string[];
}

export type ThemeTier = {
	slug: string;
	feature: string;
	platform: string;
};

interface StarterDesign {
	slug: string;
	title: string;
	description: string;
	recipe: DesignRecipe;
	categories: Category[];
	price?: string;
	style_variations?: StyleVariation[];
	software_sets?: SoftwareSet[];
	is_virtual: boolean;
	preview_data: PreviewData | null;
	design_type?: DesignType;
	theme_type?: string;
	screenshot?: string;
	theme_tier: ThemeTier;
}

export function useStarterDesignsQuery(
	queryParams: StarterDesignsQueryParams,
	{ select, ...queryOptions }: Options = {}
): UseQueryResult< StarterDesigns > {
	return useQuery( {
		queryKey: [ 'starter-designs', queryParams ],
		queryFn: () => fetchStarterDesigns( queryParams ),
		select: ( response: StarterDesignsResponse ) => {
			const allDesigns = {
				filters: {
					subject: response.filters?.subject || {},
				},
				designs: response.static?.designs?.map( apiStarterDesignsToDesign ),
				recommendation: response.recommendation,
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

function apiStarterDesignsToDesign( design: StarterDesign ): Design {
	const {
		slug,
		title,
		description,
		recipe,
		categories,
		price,
		style_variations,
		software_sets,
		preview_data,
		design_type,
		screenshot,
		theme_tier,
	} = design;

	const is_externally_managed = design.theme_type === 'managed-external';
	const is_bundled_with_woo = ( design.software_sets || [] ).some(
		( { slug } ) => slug === 'woo-on-plans'
	);

	return {
		slug,
		title,
		description,
		recipe,
		categories,
		is_externally_managed,
		is_bundled_with_woo,
		price,
		software_sets,
		design_type: design_type ?? ( theme_tier?.slug === 'free' ? 'standard' : 'premium' ),
		style_variations,
		is_virtual: design.is_virtual && !! design.recipe?.pattern_ids?.length,
		...( preview_data && { preview_data } ),
		theme: '',
		screenshot,
		design_tier: theme_tier?.slug,
	};
}
