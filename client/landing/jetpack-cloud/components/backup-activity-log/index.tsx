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
import { getHttpData } from 'state/data-layer/http-data';
import { requestActivityLogs, requestActivityLogsId } from 'state/data-getters';
import ActivityCard from 'landing/jetpack-cloud/components/activity-card';
import Pagination from 'components/pagination';

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
	baseFilter?: Filter;
	pageSize?: number;
	siteId: number;
}

const BackupActivityLog: FunctionComponent< Props > = ( {
	baseFilter = { page: 1 },
	pageSize = 10,
	siteId,
} ) => {
	const translate = useTranslate();

	const activities = useSelector< object, Array< Activity > | undefined >(
		() => getHttpData( requestActivityLogsId( siteId, baseFilter ) ).data
	);

	const [ page, setPage ] = useState( 1 );

	const filter = {
		...baseFilter,
		page,
	};

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

	const renderData = ( loadedActivities: Array< Activity > ) => {
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

	return <div>{ activities ? renderData( activities ) : <p>{ 'loading...' }</p> }</div>;
};

export default BackupActivityLog;
