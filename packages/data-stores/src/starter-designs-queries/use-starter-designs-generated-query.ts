import { useQuery, UseQueryResult } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { StarterDesignsGenerated } from './types';
import type { Design } from '@automattic/design-picker/src/types';

export function useStarterDesignsGeneratedQuery(): UseQueryResult< Design[] > {
	return useQuery( [ 'starter-designs-generated' ], () => fetchStarterDesignsGenerated(), {
		select: ( response ) => response.map( apiStarterDesignsGeneratedToDesign ),
		enabled: true,
		refetchOnMount: 'always',
		staleTime: Infinity,
	} );
}

function fetchStarterDesignsGenerated(): Promise< StarterDesignsGenerated[] > {
	return wpcomRequest< StarterDesignsGenerated[] >( {
		apiNamespace: 'wpcom/v2',
		path: '/starter-designs/generated',
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
	};
}
