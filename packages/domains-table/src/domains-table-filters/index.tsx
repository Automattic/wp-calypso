import SearchControl, { SearchIcon } from '@automattic/search';
import './style.scss';
import { useI18n } from '@wordpress/react-i18n';

export interface DomainsTableFilter {
	query: string;
}

interface DomainsTableFiltersProps {
	onSearch( query: string ): void;
	filter: DomainsTableFilter;
}

export const DomainsTableFilters = ( { onSearch, filter }: DomainsTableFiltersProps ) => {
	const { __ } = useI18n();

	return (
		<div className="domains-table-filter">
			<SearchControl
				searchIcon={ <SearchIcon /> }
				className="domains-table-filter__search"
				onSearch={ ( query ) => onSearch( query.trim() ) }
				defaultValue={ filter.query }
				isReskinned
				placeholder={ __( 'Search by domain…' ) }
				disableAutocorrect={ true }
			/>
		</div>
	);
};
