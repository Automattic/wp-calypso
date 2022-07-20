import { useFuzzySearch } from '@automattic/search';
import { ClassNames } from '@emotion/react';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import page from 'page';
import { SitesSearch } from './sites-search';
import { SitesSearchIcon } from './sites-search-icon';
import { SitesTable } from './sites-table';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SearchableSitesTableProps {
	sites: SiteExcerptData[];
	initialSearch?: string;
}

export function SearchableSitesTable( { sites, initialSearch }: SearchableSitesTableProps ) {
	const { __ } = useI18n();

	const { setQuery, results } = useFuzzySearch( {
		data: sites,
		keys: [ 'URL', 'name', 'slug' ],
		initialQuery: initialSearch,
	} );

	const handleSearch = ( rawTerm: string ) => {
		const trimmedTerm = rawTerm.trim();
		setQuery( trimmedTerm );
		if ( trimmedTerm.length ) {
			page(
				addQueryArgs( window.location.pathname + window.location.search, { search: trimmedTerm } )
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
							isReskinned
							placeholder={ __( 'Search by name or domain…' ) }
							defaultValue={ initialSearch }
						/>
					</div>
					{ results.length > 0 ? (
						<SitesTable sites={ results } />
					) : (
						<h2>{ __( 'No sites match your search.' ) }</h2>
					) }
				</>
			) }
		</ClassNames>
	);
}
