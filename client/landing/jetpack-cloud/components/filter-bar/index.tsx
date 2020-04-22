/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import ActivityTypeSelector from './activity-type-selector';
import {
	getRequestActivityActionTypeCountsId,
	requestActivityActionTypeCounts,
} from 'state/data-getters';
import { getHttpData } from 'state/data-layer/http-data';
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

interface ActivityCount {
	count: number;
	key: string;
	name: string;
}

interface Props {
	siteId: number;
	// group?: string[];
	filter: Filter;
	onFilterChange: ( newFilter: Filter ) => void;
	showActivityTypeSelector?: boolean;
	showDateRangeSelector?: boolean;
}

const FilterBar: FunctionComponent< Props > = ( {
	siteId,
	filter,
	showActivityTypeSelector = true,
	showDateRangeSelector = true,
	onFilterChange,
} ) => {
	const translate = useTranslate();
	const [ isActivityTypeSelectorVisible, setIsActivityTypeSelectorVisible ] = useState( false );

	const activityActionTypeCounts = useSelector< object, ActivityCount[] >(
		() => getHttpData( getRequestActivityActionTypeCountsId( siteId, filter ) ).data
	);

	const toggleIsActivityTypeSelectorVisible = () => {
		setIsActivityTypeSelectorVisible( ! isActivityTypeSelectorVisible );
	};

	const closeActivityTypeSelector = () => {
		setIsActivityTypeSelectorVisible( false );
	};

	useEffect( () => {
		requestActivityActionTypeCounts( siteId, filter );
	}, [ filter, siteId ] );

	const render = () => (
		<>
			<p>{ translate( 'Filter by:' ) }</p>
			{ showActivityTypeSelector && (
				<ActivityTypeSelector
					isVisible={ isActivityTypeSelectorVisible }
					onClick={ toggleIsActivityTypeSelectorVisible }
					onClose={ closeActivityTypeSelector }
					activityCounts={ activityActionTypeCounts }
					onGroupsChange={ ( newGroups ) => onFilterChange( { ...filter, group: newGroups } ) }
					groups={ filter.group || [] }
				/>
			) }
			{ showDateRangeSelector && <div>{ translate( 'Date range' ) }</div> }
		</>
	);

	return <div className="filter-bar">{ activityActionTypeCounts && render() }</div>;
};

export default FilterBar;
