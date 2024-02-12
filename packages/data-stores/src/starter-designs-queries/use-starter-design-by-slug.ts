import { useLocale } from '@automattic/i18n-utils';
import { useQuery, UseQueryResult, QueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Design } from '@automattic/design-picker/src/types';

interface Options extends QueryOptions< Design > {
	enabled?: boolean;
	select?: ( response: Design ) => Design;
}

export function useStarterDesignBySlug(
	slug: string,
	queryOptions: Options = {}
): UseQueryResult< Design > {
	const localeSlug = useLocale();

	return useQuery( {
		queryKey: [ 'starter-designs-get', slug, localeSlug ],
		queryFn: () => fetchStarterDesignBySlug( slug, localeSlug ),
		refetchOnMount: 'always',
		staleTime: Infinity,
		...queryOptions,
	} );
}

function fetchStarterDesignBySlug( slug: string, localeSlug: string ): Promise< Design > {
	const params = new URLSearchParams( { _locale: localeSlug } );

	return wpcomRequest< Design >( {
		apiNamespace: 'wpcom/v2',
		path: `/starter-designs/${ encodeURIComponent( slug ) }`,
		query: params.toString(),
	} );
}
