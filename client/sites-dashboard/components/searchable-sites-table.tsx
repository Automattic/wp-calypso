import { ClassNames } from '@emotion/react';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState } from 'react';
import { searchCollection } from 'calypso/components/search-sites/utils';
import { SitesSearch } from './sites-search';
import { SitesSearchIcon } from './sites-search-icon';
import { SitesTable } from './sites-table';
import type { SiteExcerptData } from '../use-sites-data-query';

interface SearchableSitesTableProps {
	sites: SiteExcerptData[];
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

	const handleSearch = ( rawTerm: string ) => setTerm( rawTerm.trim() );

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
							searchIcon={ <SitesSearchIcon /> }
							onSearch={ handleSearch }
							delaySearch
							isReskinned
							placeholder={ __( 'Search by name or domain…' ) }
						/>
					</div>
					{ filteredSites.length > 0 ? (
						<SitesTable sites={ filteredSites } />
					) : (
						<h2>{ __( 'No sites match your search.' ) }</h2>
					) }
				</>
			) }
		</ClassNames>
	);
}
