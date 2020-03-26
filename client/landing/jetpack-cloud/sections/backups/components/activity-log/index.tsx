/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getHttpData } from 'state/data-layer/http-data';
import { requestActivityLogs, requestActivityLogsId } from 'state/data-getters';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
import { useLocalizedMoment } from 'components/localized-moment';
import Spinner from 'components/spinner';

interface Props {
	siteId: number;
	allowRestore: boolean;
}

interface Activity {
	activityId: string;
}

const BackupActivityLog: FunctionComponent< Props > = ( { siteId, allowRestore } ) => {
	const activities = useSelector( () => getHttpData( requestActivityLogsId( siteId, {} ) ) ).data;
	const moment = useLocalizedMoment();

	useEffect( () => {
		requestActivityLogs( siteId, {} );
	}, [ siteId ] );

	const renderLoading = () => {
		return <Spinner />;
	};

	const renderData = ( loadedActivities: Array< Activity > ) => {
		return (
			<>
				{ loadedActivities.map( activity => (
					<ActivityCard
						{ ...{
							key: activity.activityId,
							moment,
							activity,
							allowRestore,
						} }
					/>
				) ) }
			</>
		);
	};

	return activities ? renderData( activities ) : renderLoading();
};

export default BackupActivityLog;
