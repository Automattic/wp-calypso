import { ClassNames } from '@emotion/react';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState } from 'react';
import { searchCollection } from 'calypso/components/search-sites/utils';
import { SitesSearch } from './sites-search';
import { SitesTable } from './sites-table';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

interface SearchableSitesTableProps {
	sites: SiteData[];
}

export function SearchableSitesTable( { sites }: SearchableSitesTableProps ) {
	const { __ } = useI18n();

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
				<>
					<div
						className={ css`
							margin: 32px 0;
							width: 286px;
							max-width: 100%;
						` }
					>
						<SitesSearch
							onSearch={ setTerm }
							delaySearch
							isReskinned
							placeholder={ __( 'Search by name or domain' ) + '...' }
						/>
					</div>
					<SitesTable sites={ filteredSites } />
				</>
			) }
		</ClassNames>
	);
}
