/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import React, { FunctionComponent, useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import { Activity, ActivityTypeCount, Filter } from './types';
import { getHttpData } from 'state/data-layer/http-data';
import {
	requestActivityLogs,
	requestActivityLogsId,
	requestActivityActionTypeCountsId,
	requestActivityActionTypeCounts,
} from 'state/data-getters';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
import Pagination from 'components/pagination';
import ActivityTypeSelector from './activity-type-selector';

interface Props {
	baseFilter?: Filter;
	pageSize?: number;
	showActivityTypeSelector?: boolean;
	siteId: number;
}

const BackupActivityLog: FunctionComponent< Props > = ( {
	baseFilter = { page: 1 },
	pageSize = 10,
	showActivityTypeSelector = true,
	siteId,
} ) => {
	const translate = useTranslate();
	const [ page, setPage ] = useState( 1 );
	const [ hiddenActivities, setHiddenActivities ] = useState< string[] >( [] );

	const filter = {
		...baseFilter,
		page,
	};

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

	const renderFilterBar = ( loadedActivityTypeCounts: ActivityTypeCount[] ) => (
		<div>
			{ translate( 'Filter by:' ) }
			{ showActivityTypeSelector && (
				<ActivityTypeSelector
					hiddenActivities={ hiddenActivities }
					activityTypeCounts={ loadedActivityTypeCounts }
					setHiddenActivities={ setHiddenActivities }
				/>
			) }
		</div>
	);
	const renderData = (
		loadedActivities: Activity[],
		loadedActivityTypeCounts: ActivityTypeCount[]
	) => {
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
				{ showActivityTypeSelector && renderFilterBar( loadedActivityTypeCounts ) }
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
			{ activities && activityTypeCounts ? (
				renderData( activities, activityTypeCounts )
			) : (
				<p>{ 'loading...' }</p>
			) }
		</div>
	);
};

export default BackupActivityLog;
