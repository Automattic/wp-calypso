/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
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
	siteId: number;
	allowRestore: boolean;
	showDateRange: boolean;
	pageSize?: number;
}

//todo: move these typings somewhere else
interface Activity {
	activityId: string;
}

interface Filter {
	page: number;
}

const BackupActivityLog: FunctionComponent< Props > = ( {
	siteId,
	allowRestore,
	pageSize = 10,
} ) => {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const filter = useSelector< object, Filter >( state => getActivityLogFilter( state, siteId ) );
	const activities = useSelector< object, Array< Activity > | undefined >(
		() => getHttpData( requestActivityLogsId( siteId, filter ) ).data
	);

	const setPage = useCallback(
		( newPage: number ) => dispatch( updateFilter( siteId, { page: newPage } ) ),
		[ dispatch, siteId ]
	);

	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );

	const renderPagination = ( key: string, total: number, page: number ) => (
		<Pagination
			key={ key }
			nextLabel={ translate( 'Older' ) }
			page={ page }
			pageClick={ setPage }
			perPage={ pageSize }
			prevLabel={ translate( 'Newer' ) }
			total={ total }
		/>
	);

	const renderData = ( loadedActivities: Array< Activity > ) => {
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
						allowRestore,
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
		<div className="activity-log">
			<Filterbar
				{ ...{
					siteId,
					filter,
					isVisible: true,
					isLoading: ! activities,
				} }
			/>
			{ /* todo: no spinners, but for now it works in a pinch */ }
			{ activities ? renderData( activities ) : <Spinner /> }
		</div>
	);
};

export default BackupActivityLog;
