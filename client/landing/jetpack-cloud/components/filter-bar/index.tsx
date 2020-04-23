/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect, useState, useRef } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getHttpData } from 'state/data-layer/http-data';
import {
	getRequestActivityActionTypeCountsId,
	requestActivityActionTypeCounts,
} from 'state/data-getters';
import ActivityTypeSelector from './activity-type-selector';
import Gridicon from 'components/gridicon';

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
	const [ isDateRangeSelectorVisible, setIsDateRangeSelectorVisible ] = useState( false );

	const activityActionTypeCounts = useSelector< object, ActivityCount[] >(
		() => getHttpData( getRequestActivityActionTypeCountsId( siteId, filter ) ).data
	);

	const toggleIsActivityTypeSelectorVisible = () => {
		setIsDateRangeSelectorVisible( false );
		setIsActivityTypeSelectorVisible( ! isActivityTypeSelectorVisible );
	};

	const closeActivityTypeSelector = () => {
		setIsActivityTypeSelectorVisible( false );
	};

	const toggleIsDateRangeSelectorVisible = () => {
		setIsActivityTypeSelectorVisible( false );
		setIsDateRangeSelectorVisible( ! isDateRangeSelectorVisible );
	};

	const activityTypeButtonRef = useRef< Button >( null );
	const dateRangeButtonRef = useRef< Button >( null );

	// const closeDateRangeSelector = () => {
	// 	setIsDateRangeSelectorVisible( false );
	// };

	const getButtonClassName = ( isActive: boolean, hasSelections: boolean ) => {
		if ( hasSelections ) {
			return 'filter-bar__button-with-selections';
		}

		return isActive ? 'filter-bar__button-active' : 'filter-bar__button';
	};

	const renderActivityTypeSelectorButtonText = ( groups?: string[] ) =>
		groups
			? translate( 'Activity type: %d selected', {
					args: [ groups.length ],
			  } )
			: translate( 'Activity type' );

	const onGroupsChange = ( newGroups: string[] ) =>
		onFilterChange( { ...filter, group: newGroups.length > 0 ? newGroups : undefined } );

	// when the filter changes re-request the activity counts
	// the activity counts only use the date values, but the underlying data layer handles unnecessary re-requests via freshness
	useEffect( () => {
		requestActivityActionTypeCounts( siteId, filter );
	}, [ filter, siteId ] );

	const render = () => (
		<>
			<p>{ translate( 'Filter by:' ) }</p>
			{ showActivityTypeSelector && (
				<>
					<div className="filter-bar__button-group">
						<Button
							className={ getButtonClassName(
								isActivityTypeSelectorVisible,
								filter.group !== undefined
							) }
							compact
							onClick={ toggleIsActivityTypeSelectorVisible }
							ref={ activityTypeButtonRef }
						>
							{ renderActivityTypeSelectorButtonText( filter.group ) }
						</Button>
						{ filter.group && (
							<Button
								className="filter-bar__clear-selection-button"
								compact
								onClick={ () => onGroupsChange( [] ) }
							>
								<Gridicon icon="cross" />
							</Button>
						) }
					</div>
					<ActivityTypeSelector
						activityCounts={ activityActionTypeCounts }
						context={ activityTypeButtonRef }
						groups={ filter.group || [] }
						isVisible={ isActivityTypeSelectorVisible }
						onClose={ closeActivityTypeSelector }
						onGroupsChange={ onGroupsChange }
					/>
				</>
			) }
			{ showDateRangeSelector && (
				<Button
					className={ getButtonClassName( isDateRangeSelectorVisible, false ) }
					compact
					onClick={ toggleIsDateRangeSelectorVisible }
					ref={ dateRangeButtonRef }
				>
					{ translate( 'Date range' ) }
				</Button>
			) }
		</>
	);

	return <div className="filter-bar">{ activityActionTypeCounts && render() }</div>;
};

export default FilterBar;
