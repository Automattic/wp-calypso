/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Style dependencies
 */
import './style.scss';

interface Filter {
	group?: string[];
	after?: string;
	before?: string;
	page: number;
}

interface Props {
	filter?: Filter;
	onFilterChange?: ( newFilter: Filter ) => void;
	showActivityTypeSelector: boolean;
	showDateRangeSelector: boolean;
}

const FilterBar: FunctionComponent< Props > = ( {
	showActivityTypeSelector = true,
	showDateRangeSelector = true,
} ) => {
	const translate = useTranslate();

	return (
		<div className="filter-bar">
			<p>{ translate( 'Filter by:' ) }</p>
			{ showActivityTypeSelector && <div>{ translate( 'Activity type' ) }</div> }
			{ showDateRangeSelector && <div>{ translate( 'Date range' ) }</div> }
		</div>
	);
};

export default FilterBar;
