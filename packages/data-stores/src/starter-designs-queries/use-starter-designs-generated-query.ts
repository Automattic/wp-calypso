import { stringify } from 'qs';
import { useQuery, UseQueryResult, QueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { StarterDesignsGenerated, StarterDesignsGeneratedQueryParams } from './types';
import type { Design } from '@automattic/design-picker/src/types';

interface Options extends QueryOptions< StarterDesignsGenerated[], unknown > {
	enabled?: boolean;
}

export function useStarterDesignsGeneratedQuery(
	queryParams: StarterDesignsGeneratedQueryParams,
	queryOptions: Options = {}
): UseQueryResult< Design[] > {
	return useQuery(
		[ 'starter-designs-generated', queryParams ],
		() => fetchStarterDesignsGenerated( queryParams ),
		{
			select: ( response: StarterDesignsGenerated[] ) =>
				response.map( apiStarterDesignsGeneratedToDesign ),
			refetchOnMount: 'always',
			staleTime: Infinity,
			...queryOptions,
		}
	);
}

function fetchStarterDesignsGenerated(
	queryParams: StarterDesignsGeneratedQueryParams
): Promise< StarterDesignsGenerated[] > {
	return wpcomRequest< StarterDesignsGenerated[] >( {
		apiNamespace: 'wpcom/v2',
		path: '/starter-designs/generated',
		query: stringify( queryParams ),
	} );
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
