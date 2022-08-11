import { useFuzzySearch } from '@automattic/search';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { SiteStatus, SiteObjectWithStatus } from './site-status';

interface SitesTableFilterOptions {
	status?: string;
	search?: string;
}

interface Status {
	title: React.ReactChild;
	name: 'all' | SiteStatus;
	count: number;
}

interface UseSitesTableFilteringResult< T > {
	filteredSites: T[];
	statuses: Status[];
}

type SiteObjectWithBasicInfo = SiteObjectWithStatus & {
	URL: string;
	name: string;
	slug: string;
};

export function useSitesTableFiltering< T extends SiteObjectWithBasicInfo >(
	allSites: T[],
	{ status = 'all', search }: SitesTableFilterOptions
): UseSitesTableFilteringResult< T > {
	const { __ } = useI18n();

	const [ statuses, filteredByStatus ] = useMemo( () => {
		const statuses = [
			{ name: 'all' as const, title: __( 'All Sites' ), count: 0 },
			{ name: 'public' as const, title: __( 'Public' ), count: 0 },
			{ name: 'private' as const, title: __( 'Private' ), count: 0 },
			{ name: 'coming-soon' as const, title: __( 'Coming Soon' ), count: 0 },
		];

		const filteredByStatus = statuses.reduce(
			( acc, { name } ) => ( { ...acc, [ name ]: filterSites( allSites, name ) } ),
			{} as { [ name: string ]: T[] }
		);

		for ( const status of statuses ) {
			status.count = filteredByStatus[ status.name ].length;
		}

		return [ statuses, filteredByStatus ];
	}, [ allSites, __ ] );

	const filteredSites = useFuzzySearch( {
		data: filteredByStatus[ status ] || [],
		keys: [ 'URL', 'name', 'slug' ],
		query: search,
	} );

	return { filteredSites, statuses };
}

function filterSites< T extends SiteObjectWithStatus >( sites: T[], filterType: string ): T[] {
	return sites.filter( ( site ) => {
		const isComingSoon =
			site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );

		switch ( filterType ) {
			case 'public':
				return ! site.is_private && ! isComingSoon;
			case 'private':
				return site.is_private && ! isComingSoon;
			case 'coming-soon':
				return isComingSoon;
			default:
				// Treat unknown filters the same as 'all'
				return site;
		}
	} );
}
