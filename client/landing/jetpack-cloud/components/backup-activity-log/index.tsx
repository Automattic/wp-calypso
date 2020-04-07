/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import React, { FunctionComponent, useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import { Activity, ActivityTypeCount, Filter } from './types';
import { getHttpData } from 'state/data-layer/http-data';
import {
	requestActivityLogs,
	requestActivityLogsId,
	requestActivityCountsId,
	requestActivityCounts,
	requestActivityActionTypeCountsId,
	requestActivityActionTypeCounts,
} from 'state/data-getters';
import { useLocalizedMoment } from 'components/localized-moment';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
import ActivityTypeSelector from './activity-type-selector';
import ActivityTypeSelectorPlaceholder from './activity-type-selector/placeholder';
import DateRangeSelector from './date-range-selector';
import DateRangeSelectorPlaceholder from './date-range-selector/placeholder';
import Pagination from 'components/pagination';
import Spinner from 'components/spinner';

interface Props {
	baseFilter?: Filter;
	pageSize?: number;
	showActivityTypeSelector?: boolean;
	showDateRangeSelector?: boolean;
	siteId: number;
}

const BackupActivityLog: FunctionComponent< Props > = ( {
	baseFilter = { page: 1 },
	pageSize = 10,
	showActivityTypeSelector = true,
	showDateRangeSelector = true,
	siteId,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const [ page, setPage ] = useState( 1 );
	const [ hiddenActivities, setHiddenActivities ] = useState< string[] >( [] );

	const [ selectedStartDate, setSelectedStartDate ] = useState< Moment | null >( null );
	const [ selectedEndDate, setSelectedEndDate ] = useState< Moment | null >( null );

	const filter = {
		...baseFilter,
		page,
	};

	const onDateCommit = (
		newSelectedStartDate: Moment | null,
		newSelectedEndDate: Moment | null
	) => {
		setSelectedStartDate( newSelectedStartDate );
		setSelectedEndDate( newSelectedEndDate );
	};

	// we use this request to get the date ranges and therefore do not want to subject i tto filter limitations
	const activityCounts = useSelector(
		() => getHttpData( requestActivityCountsId( siteId, {} ) ).data
	);

	const oldestDate = activityCounts ? moment( activityCounts[ 0 ].date ) : null;
	const newestDate = activityCounts
		? moment( activityCounts[ activityCounts.length - 1 ].date )
		: null;

	if ( selectedStartDate ) {
		filter.after = selectedStartDate.toISOString();
	}
	if ( selectedEndDate ) {
		filter.before = selectedEndDate.toISOString();
	}

	// IMPORTANT! The order is very specifically  get `activityTypeCounts` -> add groups to filter -> get `activities`
	const activityTypeCounts = useSelector< object, ActivityTypeCount[] | undefined >(
		() => getHttpData( requestActivityActionTypeCountsId( siteId, filter ) ).data
	);

	if ( hiddenActivities.length > 0 ) {
		filter.group = ( activityTypeCounts || [] )
			.filter( ( { key } ) => ! hiddenActivities.includes( key ) )
			.map( ( { key } ) => key );
	}

	const activities = useSelector< object, Activity[] | undefined >(
		() => getHttpData( requestActivityLogsId( siteId, filter ) ).data
	);

	useEffect( () => {
		requestActivityLogs( siteId, filter );
		requestActivityCounts( siteId, filter );
		requestActivityActionTypeCounts( siteId, filter );
	}, [ filter, siteId ] );

	const renderPagination = ( key: string, total: number, actualPage: number ) => (
		<Pagination
			key={ key }
			nextLabel={ translate( 'Older' ) }
			page={ actualPage }
			pageClick={ setPage }
			perPage={ pageSize }
			prevLabel={ translate( 'Newer' ) }
			total={ total }
		/>
	);

	const renderActivityTypeSelector = () =>
		activityTypeCounts ? (
			<ActivityTypeSelector
				hiddenActivities={ hiddenActivities }
				activityTypeCounts={ activityTypeCounts }
				setHiddenActivities={ setHiddenActivities }
			/>
		) : (
			<ActivityTypeSelectorPlaceholder />
		);

	const renderDateRangeSelector = () =>
		oldestDate && newestDate ? (
			<DateRangeSelector
				selectedStartDate={ selectedStartDate }
				selectedEndDate={ selectedEndDate }
				oldestDate={ oldestDate }
				newestDate={ newestDate }
				onDateCommit={ onDateCommit }
			/>
		) : (
			<DateRangeSelectorPlaceholder />
		);

	const renderFilterBar = () => (
		<div>
			{ translate( 'Filter by:' ) }
			{ showActivityTypeSelector && renderActivityTypeSelector() }
			{ showDateRangeSelector && renderDateRangeSelector() }
		</div>
	);

	const renderLogs = ( loadedActivities: Activity[] ) => {
		const actualPage = Math.max(
			1,
			Math.min( page, Math.ceil( loadedActivities.length / pageSize ) )
		);

		const renderedActivities = loadedActivities
			.slice( ( actualPage - 1 ) * pageSize, actualPage * pageSize )
			.map( activity => (
				<ActivityCard
					{ ...{
						key: activity.activityId,
						moment,
						activity,
						allowRestore: false,
					} }
				/>
			) );

		return (
			<>
				{ renderPagination( 'activity-log__pagination-top', loadedActivities.length, actualPage ) }
				{ renderedActivities }
				{ renderPagination(
					'activity-log__pagination-bottom',
					loadedActivities.length,
					actualPage
				) }
			</>
		);
	};

	return (
		<div>
			{ ( showActivityTypeSelector || showDateRangeSelector ) && renderFilterBar() }
			{ activities ? renderLogs( activities ) : <Spinner /> }
		</div>
	);
};

export default BackupActivityLog;
