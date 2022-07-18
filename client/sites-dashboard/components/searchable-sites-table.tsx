import { ClassNames } from '@emotion/react';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import page from 'page';
import { useMemo, useState } from 'react';
import { searchCollection } from 'calypso/components/search-sites/utils';
import { SitesSearch } from './sites-search';
import { SitesSearchIcon } from './sites-search-icon';
import { SitesTable } from './sites-table';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

interface SearchableSitesTableProps {
	sites: SiteData[];
	initialSearch?: string;
}

export function SearchableSitesTable( { sites, initialSearch }: SearchableSitesTableProps ) {
	const { __ } = useI18n();

	const [ term, setTerm ] = useState( initialSearch );

	const filteredSites = useMemo( () => {
		if ( ! term ) {
			return sites;
		}

		return searchCollection( sites, term.toLowerCase(), [ 'URL', 'domain', 'name', 'slug' ] );
	}, [ term, sites ] );

	const handleSearch = ( rawTerm: string ) => {
		setTerm( rawTerm.trim() );
		const encodedTerm = encodeURIComponent( rawTerm.trim() );
		if ( encodedTerm.length ) {
			page(
				addQueryArgs( window.location.pathname + window.location.search, { search: encodedTerm } )
			);
		} else {
			page( removeQueryArgs( window.location.pathname + window.location.search, 'search' ) );
		}
	};

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
							defaultValue={ initialSearch }
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
