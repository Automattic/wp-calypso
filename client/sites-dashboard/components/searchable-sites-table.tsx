import { ClassNames } from '@emotion/react';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { searchCollection } from 'calypso/components/search-sites/utils';
import { useSearchParams } from '../use-search-params';
import { SitesSearch } from './sites-search';
import { SitesSearchIcon } from './sites-search-icon';
import { SitesTable } from './sites-table';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

interface SearchableSitesTableProps {
	sites: SiteData[];
}

export function SearchableSitesTable( { sites }: SearchableSitesTableProps ) {
	const { __ } = useI18n();
	const [ searchParams, setSearchParam ] = useSearchParams();

	const filteredSites = useMemo( () => {
		if ( ! searchParams.search ) {
			return sites;
		}

		return searchCollection( sites, searchParams.search.toLowerCase(), [
			'URL',
			'domain',
			'name',
			'slug',
		] );
	}, [ sites, searchParams.search ] );

	const handleSearch = ( rawTerm: string ) => {
		setSearchParam( 'search', rawTerm.trim() );
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
							defaultValue={ searchParams.search }
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
