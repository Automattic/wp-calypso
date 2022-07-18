import { stringify } from 'qs';
import { useQuery, UseQueryResult, QueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type {
	StarterDesignsGenerated,
	StarterDesignsGeneratedQueryParams,
	AllStarterDesigns,
} from './types';
import type { Design } from '@automattic/design-picker/src/types';

interface Options extends QueryOptions< AllStarterDesignsResponse, unknown > {
	enabled?: boolean;
}

interface AllStarterDesignsResponse {
	generated: { designs: StarterDesignsGenerated[] };
	static: { designs: Design[] };
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
				static: response.static,
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
