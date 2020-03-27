/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import React, { FunctionComponent, useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import { getHttpData } from 'state/data-layer/http-data';
import { requestActivityLogs, requestActivityLogsId } from 'state/data-getters';
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

interface Activity {
	activityId: string;
}

const BackupActivityLog: FunctionComponent< Props > = ( {
	siteId,
	allowRestore,
	pageSize = 10,
} ) => {
	const filter = useSelector( state => getActivityLogFilter( state, siteId ) );
	const activities = useSelector( () => getHttpData( requestActivityLogsId( siteId, filter ) ) )
		.data;

	const moment = useLocalizedMoment();

	const [ page, setPage ] = useState( 1 );

	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );

	// todo: no spinners, but for now it works in a pinch
	const renderLoading = () => {
		return <Spinner />;
	};

	const renderData = ( loadedActivities: Array< Activity > ) => {
		const renderedActivities = loadedActivities
			.slice( ( page - 1 ) * pageSize, page * pageSize )
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
				<Filterbar
					{ ...{
						siteId,
						filter,
						isVisible: true,
					} }
				/>
				<Pagination
					page={ page }
					perPage={ pageSize }
					total={ loadedActivities.length }
					pageClick={ setPage }
				/>
				{ renderedActivities }
				<Pagination
					page={ page }
					perPage={ pageSize }
					total={ loadedActivities.length }
					pageClick={ setPage }
				/>
			</>
		);
	};

	return (
		<div className="activity-log">{ activities ? renderData( activities ) : renderLoading() }</div>
	);
};

export default BackupActivityLog;
