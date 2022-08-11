import { useFuzzySearch } from '@automattic/search';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { SiteStatus, SiteObjectWithStatus, getSiteStatus } from './site-status';

interface SitesTableFilterOptions {
	status?: Status[ 'name' ];
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

	const [ statuses, groupedByStatus ] = useMemo( () => {
		const statuses = [
			{ name: 'all' as const, title: __( 'All Sites' ), count: 0 },
			{ name: 'public' as const, title: __( 'Public' ), count: 0 },
			{ name: 'private' as const, title: __( 'Private' ), count: 0 },
			{ name: 'coming-soon' as const, title: __( 'Coming Soon' ), count: 0 },
		];

		const groupedByStatus = allSites.reduce< { [ K in Status[ 'name' ] ]: T[] } >(
			( groups, site ) => {
				const siteStatus = getSiteStatus( site );
				groups[ siteStatus ].push( site );

				return groups;
			},
			{ all: allSites, 'coming-soon': [], public: [], private: [] }
		);

		for ( const status of statuses ) {
			status.count = groupedByStatus[ status.name ].length;
		}

		return [ statuses, groupedByStatus ];
	}, [ allSites, __ ] );

	const filteredSites = useFuzzySearch( {
		data: groupedByStatus.hasOwnProperty( status ) ? groupedByStatus[ status ] : [],
		keys: [ 'URL', 'name', 'slug' ],
		query: search,
	} );

	return { filteredSites, statuses };
}
