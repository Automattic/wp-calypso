/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
// import Filterbar from 'my-sites/activity/filterbar';
import { getHttpData } from 'state/data-layer/http-data';
import { requestActivityLogs, requestActivityLogsId } from 'state/data-getters';
import { useLocalizedMoment } from 'components/localized-moment';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
import Pagination from 'components/pagination';
import Spinner from 'components/spinner';

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
	const activities = useSelector( () => getHttpData( requestActivityLogsId( siteId, {} ) ) ).data;
	const moment = useLocalizedMoment();

	const [ page, setPage ] = useState( 1 );

	useEffect( () => {
		requestActivityLogs( siteId, {} );
	}, [ siteId ] );

	// todo: no spinners, but for now it works in a pinch
	const renderLoading = () => {
		return <Spinner />;
	};

	const renderData = ( loadedActivities: Array< Activity > ) => {
		return (
			<>
				<Pagination
					page={ page }
					perPage={ pageSize }
					total={ loadedActivities.length }
					pageClick={ setPage }
				/>
				{ loadedActivities.slice( ( page - 1 ) * pageSize, page * pageSize ).map( activity => (
					<ActivityCard
						{ ...{
							key: activity.activityId,
							moment,
							activity,
							allowRestore,
						} }
					/>
				) ) }
				<Pagination
					page={ page }
					perPage={ pageSize }
					total={ loadedActivities.length }
					pageClick={ setPage }
				/>
			</>
		);
	};

	return activities ? renderData( activities ) : renderLoading();
};

export default BackupActivityLog;
