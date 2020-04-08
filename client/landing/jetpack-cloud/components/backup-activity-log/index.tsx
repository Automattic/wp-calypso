/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect, useCallback } from 'react';

/**
 * Internal dependencies
 */
import { Activity, Filter } from './types';
import { getHttpData } from 'state/data-layer/http-data';
import { requestActivityLogs, requestActivityLogsId } from 'state/data-getters';
import { updateFilter } from 'state/activity-log/actions';
import { useLocalizedMoment } from 'components/localized-moment';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
import Filterbar from 'my-sites/activity/filterbar';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Pagination from 'components/pagination';
import Spinner from 'components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	baseFilter?: Filter;
	pageSize?: number;
	showActivityTypeSelector?: boolean;
	showDateRangeSelector?: boolean;
	siteId: number;
}

const BackupActivityLog: FunctionComponent< Props > = ( {
	pageSize = 10,
	showActivityTypeSelector = true,
	showDateRangeSelector = true,
	siteId,
} ) => {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const filter = useSelector( state => getActivityLogFilter< object, Filter >( state, siteId ) );
	const activities = useSelector< object, Activity[] | undefined >(
		() => getHttpData( requestActivityLogsId( siteId, filter ) ).data
	);

	const setPage = useCallback(
		( page: number ) => {
			dispatch( updateFilter( { page } ) );
		},
		[ dispatch ]
	);

	useEffect( () => {
		requestActivityLogs( siteId, filter );
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

	const renderLogs = ( loadedActivities: Activity[] ) => {
		const actualPage = Math.max(
			1,
			Math.min( filter.page, Math.ceil( loadedActivities.length / pageSize ) )
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
				{ renderPagination(
					'backup-activity-log__pagination-top',
					loadedActivities.length,
					actualPage
				) }
				{ renderedActivities }
				{ renderPagination(
					'backup-activity-log__pagination-bottom',
					loadedActivities.length,
					actualPage
				) }
			</>
		);
	};

	return (
		<div>
			{ ( showActivityTypeSelector || showDateRangeSelector ) && (
				<Filterbar
					filter={ filter }
					isLoading={ ! activities }
					isVisible={ true }
					siteId={ siteId }
					useActivityTypeSelector={ showActivityTypeSelector }
					useDateRangeSelector={ showDateRangeSelector }
				/>
			) }
			{ activities ? renderLogs( activities ) : <Spinner /> }
		</div>
	);
};

export default BackupActivityLog;
