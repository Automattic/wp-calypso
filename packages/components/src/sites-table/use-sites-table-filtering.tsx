import { useFuzzySearch } from '@automattic/search';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { SitesCountBadge } from './sites-count-badge';
import type { Tab } from '../tab-panel';
// eslint-disable-next-line no-restricted-imports
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesTableFilterOptions {
	status?: string;
	search?: string;
}

interface UseSitesTableFilteringResult {
	filteredSites: SiteExcerptData[];
	tabs: Tab[];
	selectedTabHasSites: boolean;
}

export function useSitesTableFiltering(
	allSites: SiteExcerptData[],
	{ status = 'all', search }: SitesTableFilterOptions
): UseSitesTableFilteringResult {
	const { __ } = useI18n();

	const [ tabs, filteredByStatus ] = useMemo( () => {
		const tabs: Tab[] = [
			{ name: 'all', title: __( 'All' ) },
			{ name: 'launched', title: __( 'Launched' ) },
			{ name: 'private', title: __( 'Private' ) },
			{ name: 'coming-soon', title: __( 'Coming soon' ) },
		];

		const filteredByStatus = tabs.reduce(
			( acc, { name } ) => ( { ...acc, [ name ]: filterSites( allSites, name ) } ),
			{} as { [ name: string ]: SiteExcerptData[] }
		);

		for ( const tab of tabs ) {
			tab.title = (
				<>
					{ tab.title } <SitesCountBadge>{ filteredByStatus[ tab.name ].length }</SitesCountBadge>
				</>
			);
		}

		return [ tabs, filteredByStatus ];
	}, [ allSites, __ ] );

	const filteredSites = useFuzzySearch( {
		data: filteredByStatus[ status ],
		keys: [ 'URL', 'name', 'slug' ],
		query: search,
	} );

	// If `filteredSites` is empty we want to know whether that's due to
	// there being no sites in the selected tab or because the search has
	// found no sites.
	const selectedTabHasSites = !! filteredByStatus[ status ].length;

	return { filteredSites, tabs, selectedTabHasSites };
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
