import { ClassNames } from '@emotion/react';
import Search from 'calypso/components/search';
import { useFuzzySearch } from 'calypso/components/search/use-fuzzy-search';
import { SitesTable } from './sites-table';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export function SearchableSitesTable( { sites }: { className?: string; sites: SiteData[] } ) {
	const { query, setQuery, results } = useFuzzySearch( {
		data: sites,
		fields: [ 'URL', 'domain', 'name', 'slug' ],
	} );

	return (
		<ClassNames>
			{ ( { css } ) => (
				<div
					className={ css`
						margin-top: 32px;
					` }
				>
					<Search onSearch={ setQuery } value={ query } />
					<SitesTable sites={ results } />
				</div>
			) }
		</ClassNames>
	);
}
