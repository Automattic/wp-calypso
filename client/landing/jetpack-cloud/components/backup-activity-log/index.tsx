/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import moment from 'moment';
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { getHttpData } from 'state/data-layer/http-data';
import { requestActivityLogs, requestActivityLogsId } from 'state/data-getters';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';

// TODO: move these interfaces to dedicated types file
// based on the how filters are used in client/state/data-getters/index.js
interface Filter {
	after?: string;
	aggregate?: boolean;
	before?: string;
	group?: Array< string >;
	on?: string;
	page: number;
}

interface Activity {
	activityId: string;
}

interface Props {
	baseFilter: Filter;
	siteId: number;
}

const BackupActivityLog: FunctionComponent< Props > = ( { baseFilter, siteId } ) => {
	const activities = useSelector< object, Array< Activity > | undefined >(
		() => getHttpData( requestActivityLogsId( siteId, baseFilter ) ).data
	);

	useEffect( () => {
		requestActivityLogs( siteId, baseFilter );
	}, [ baseFilter, siteId ] );

	const renderActivities = ( loadedActivities: Array< Activity > ) =>
		loadedActivities.map( activity => (
			<ActivityCard
				{ ...{
					key: activity.activityId,
					moment,
					activity,
					allowRestore: false,
				} }
			/>
		) );

	return <div>{ activities ? renderActivities( activities ) : <p>{ 'loading...' }</p> }</div>;
};

export default BackupActivityLog;
