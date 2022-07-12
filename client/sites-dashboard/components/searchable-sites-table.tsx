import Search from '@automattic/search';
import { ClassNames } from '@emotion/react';
import { useMemo, useState } from 'react';
import { searchCollection } from 'calypso/components/search-sites/utils';
import { SitesTable } from './sites-table';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

interface SearchableSitesTableProps {
	sites: SiteData[];
}

export function SearchableSitesTable( { sites }: SearchableSitesTableProps ) {
	const [ term, setTerm ] = useState( '' );

	const filteredSites = useMemo( () => {
		if ( ! term ) {
			return sites;
		}

		return searchCollection( sites, term.toLowerCase(), [ 'URL', 'domain', 'name', 'slug' ] );
	}, [ term, sites ] );

	return (
		<ClassNames>
			{ ( { css } ) => (
				<div
					className={ css`
						margin-top: 32px;
					` }
				>
					<Search onSearch={ setTerm } delaySearch />
					<SitesTable sites={ filteredSites } />
				</div>
			) }
		</ClassNames>
	);
}
