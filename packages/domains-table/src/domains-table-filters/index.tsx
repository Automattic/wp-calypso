import { Button } from '@automattic/components';
import SearchControl, { SearchIcon } from '@automattic/search';
import { isMobile } from '@automattic/viewport';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';

import './style.scss';

export interface DomainsTableFilter {
	query: string;
}

interface DomainsTableFiltersProps {
	onSearch( query: string ): void;
	filter: DomainsTableFilter;
}

export const DomainsTableFilters = ( { onSearch, filter }: DomainsTableFiltersProps ) => {
	const { __ } = useI18n();
	const [ search, setSearch ] = useState( filter.query );

	const isMobileDevice = isMobile();

	const handleSearchChange = ( query: string ) => {
		if ( query === '' ) {
			setSearch( '' );
			onSearch( '' );
		} else if ( isMobileDevice ) {
			setSearch( query );
		} else {
			onSearch( query );
		}
	};

	const handleSearch = () => {
		onSearch( search );
	};

	return (
		<div className="domains-table-filter">
			<SearchControl
				searchIcon={ <SearchIcon /> }
				className="domains-table-filter__search"
				onSearch={ handleSearchChange }
				defaultValue={ filter.query }
				isReskinned
				placeholder={ __( 'Search by domain…' ) }
				disableAutocorrect={ true }
			/>
			{ isMobileDevice && (
				<Button primary={ Boolean( search ) } onClick={ handleSearch }>
					{ __( 'Filter' ) }
				</Button>
			) }
		</div>
	);
};
