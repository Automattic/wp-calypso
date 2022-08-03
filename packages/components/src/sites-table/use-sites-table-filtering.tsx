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
	selectedStatusHasSites: boolean;
}

export function useSitesTableFiltering(
	allSites: SiteExcerptData[],
	{ status = 'all', search }: SitesTableFilterOptions
): UseSitesTableFilteringResult {
	const { __ } = useI18n();

	const filteredSites = useFuzzySearch( {
		data: allSites,
		keys: [ 'URL', 'name', 'slug' ],
		query: search,
	} );

	const [ statuses, filteredByStatus ] = useMemo( () => {
		const statuses = [
			{ name: 'all', title: __( 'All' ), count: 0 },
			{ name: 'launched', title: __( 'Launched' ), count: 0 },
			{ name: 'private', title: __( 'Private' ), count: 0 },
			{ name: 'coming-soon', title: __( 'Coming soon' ), count: 0 },
		];

		const filteredByStatus = statuses.reduce(
			( acc, { name } ) => ( { ...acc, [ name ]: filterSites( filteredSites, name ) } ),
			{} as { [ name: string ]: SiteExcerptData[] }
		);

		for ( const status of statuses ) {
			status.count = filteredByStatus[ status.name ].length;
		}

		return [ statuses, filteredByStatus ];
	}, [ filteredSites, __ ] );

	// If there are no sites, we need to know whether that's due to
	// there being no sites in the selected tab or because the search has
	// found no sites.
	const selectedStatusHasSites = !! filterSites( allSites, status ).length;

	return { filteredSites: filteredByStatus[ status ], statuses, selectedStatusHasSites };
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
