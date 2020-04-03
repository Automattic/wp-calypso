/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getHttpData } from 'state/data-layer/http-data';
import { requestActivityLogs, requestActivityLogsId } from 'state/data-getters';
import { updateFilter } from 'state/activity-log/actions';
import { useLocalizedMoment } from 'components/localized-moment';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
// import Filterbar from 'my-sites/activity/filterbar';
import DateRangeSelector from 'my-sites/activity/filterbar/date-range-selector';
import ActionTypeSelector from 'my-sites/activity/filterbar/action-type-selector';
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
	showDateRangeSelector?: boolean;
	showActivityTypeSelector?: boolean;
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
	allowRestore,
	pageSize = 10,
	showActivityTypeSelector = true,
	showDateRangeSelector = true,
	siteId,
} ) => {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const filter = useSelector< object, Filter >( state => getActivityLogFilter( state, siteId ) );
	const activities = useSelector< object, Array< Activity > | undefined >(
		() => getHttpData( requestActivityLogsId( siteId, filter ) ).data
	);

	const [ showActivityType, setShowActivityType ] = useState( false );
	const [ showDateRange, setShowDateRange ] = useState( false );

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

	const toggleActivityTypesSelector = () => {
		setShowActivityType( ! showActivityType );
		setShowDateRange( false );
	};

	const toggleDateRangeSelector = () => {
		setShowDateRange( ! showDateRange );
		setShowActivityType( false );
	};

	const renderFilterBar = () => {
		return (
			<div className="activity-log__filter-bar">
				<span>{ translate( 'Filter by:' ) }</span>
				{ showDateRangeSelector && (
					<DateRangeSelector
						filter={ filter }
						isVisible={ showDateRange }
						onButtonClick={ toggleDateRangeSelector }
						onClose={ () => setShowDateRange( false ) }
						siteId={ siteId }
					/>
				) }
				{ showActivityTypeSelector && (
					<ActionTypeSelector
						filter={ filter }
						isVisible={ showActivityType }
						onButtonClick={ toggleActivityTypesSelector }
						onClose={ () => setShowActivityType( false ) }
						siteId={ siteId }
					/>
				) }
			</div>
		);
	};

	return (
		<div className="activity-log">
			{ ( showDateRangeSelector || showActivityTypeSelector ) && renderFilterBar() }
			{ /* todo: no spinners, but for now it works in a pinch */ }
			{ activities ? renderData( activities ) : <Spinner /> }
		</div>
	);
};

export default BackupActivityLog;
