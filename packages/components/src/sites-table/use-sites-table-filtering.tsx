import { TabPanel } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { SitesCountBadge } from './sites-count-badge';
// eslint-disable-next-line no-restricted-imports
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SiteTab extends Omit< TabPanel.Tab, 'title' > {
	title: React.ReactChild;
}

interface SitesTableFilterOptions {
	status?: string;
}

interface UseSitesTableFilteringResult {
	filteredSites: SiteExcerptData[];
	tabs: SiteTab[];
}

export function useSitesTableFiltering(
	allSites: SiteExcerptData[],
	{ status = 'all' }: SitesTableFilterOptions
): UseSitesTableFilteringResult {
	const { __ } = useI18n();

	const [ tabs, filteredByStatus ] = useMemo( () => {
		const tabs: SiteTab[] = [
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

	return {
		filteredSites: filteredByStatus[ status ],
		tabs,
	};
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
