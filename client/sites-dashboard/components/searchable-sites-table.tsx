import { useFuzzySearch } from '@automattic/search';
import { ClassNames } from '@emotion/react';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import page from 'page';
import SelectDropdown from 'calypso/components/select-dropdown';
import { NoSitesMessage } from './no-sites-message';
import { SitesSearch } from './sites-search';
import { SitesSearchIcon } from './sites-search-icon';
import { SitesTable } from './sites-table';
import type { SiteExcerptData } from 'calypso/data/sites/use-site-excerpts-query';

interface SearchableSitesTableProps {
	sites: SiteExcerptData[];
	initialSearch?: string;
	filterOptions: SitesTableFilterOptions;
}

interface SitesTableFilterOptions {
	status?: string;
	search?: string;
}

const FilterBar = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 32px 0;
`;

const siteStatusOptions = [
	{ value: 'all', label: 'All Sites' },
	{ value: 'launched', label: 'Launched' },
	{ value: 'coming-soon', label: 'Coming Soon' },
	{ value: 'private', label: 'Private' },
];

export function SearchableSitesTable( {
	sites,
	initialSearch,
	filterOptions,
}: SearchableSitesTableProps ) {
	const { __ } = useI18n();

	const filteredSites = sites.filter( ( site ) => {
		const isComingSoon =
			site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );

		switch ( filterOptions.status ) {
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

	const { setQuery, results } = useFuzzySearch( {
		data: filteredSites,
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

	console.log( 'search:', initialSearch );

	return (
		<ClassNames>
			{ ( { css } ) => (
				<>
					<FilterBar>
						<SitesSearch
							searchIcon={ <SitesSearchIcon /> }
							onSearch={ handleSearch }
							isReskinned
							placeholder={ __( 'Search by name or domain…' ) }
							defaultValue={ initialSearch }
						/>
						<SelectDropdown
							selectedText={
								siteStatusOptions.find( ( option ) => option.value === filterOptions.status )?.label
							}
							initialSelected={ filterOptions.status }
							onSelect={ ( option ) => {
								page(
									'all' === option.value
										? removeQueryArgs( window.location.pathname + window.location.search, 'status' )
										: addQueryArgs( window.location.pathname + window.location.search, {
												status: option.value,
										  } )
								);
							} }
							options={ siteStatusOptions }
						/>
					</FilterBar>
					{ results.length > 0 ? (
						<SitesTable sites={ results } />
					) : (
						<>
							{ initialSearch ? (
								<p>{ __( 'No sites match your search.' ) }</p>
							) : (
								<NoSitesMessage status={ filterOptions.status } />
							) }
						</>
					) }
				</>
			) }
		</ClassNames>
	);
}
