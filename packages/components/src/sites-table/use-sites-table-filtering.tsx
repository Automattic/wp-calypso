import { useFuzzySearch } from '@automattic/search';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
// eslint-disable-next-line no-restricted-imports
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesTableFilterOptions {
	status?: string;
	search?: string;
}

interface Status {
	title: React.ReactChild;
	name: string;
	count: number;
}

interface UseSitesTableFilteringResult {
	filteredSites: SiteExcerptData[];
	statuses: Status[];
}

export function useSitesTableFiltering(
	allSites: SiteExcerptData[],
	{ status = 'all', search }: SitesTableFilterOptions
): UseSitesTableFilteringResult {
	const { __ } = useI18n();

	const [ statuses, filteredByStatus ] = useMemo( () => {
		const statuses = [
			{ name: 'all', title: __( 'All Sites' ), count: 0 },
			{ name: 'launched', title: __( 'Launched' ), count: 0 },
			{ name: 'private', title: __( 'Private' ), count: 0 },
			{ name: 'coming-soon', title: __( 'Coming Soon' ), count: 0 },
		];

		const filteredByStatus = statuses.reduce(
			( acc, { name } ) => ( { ...acc, [ name ]: filterSites( allSites, name ) } ),
			{} as { [ name: string ]: SiteExcerptData[] }
		);

		for ( const status of statuses ) {
			status.count = filteredByStatus[ status.name ].length;
		}

		return [ statuses, filteredByStatus ];
	}, [ allSites, __ ] );

	const filteredSites = useFuzzySearch( {
		data: filteredByStatus[ status ],
		keys: [ 'URL', 'name', 'slug' ],
		query: search,
	} );

	return { filteredSites, statuses };
}

function filterSites( sites: SiteExcerptData[], filterType: string ): SiteExcerptData[] {
	return sites.filter( ( site ) => {
		const isComingSoon =
			site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );

		switch ( filterType ) {
			case 'launched':
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
