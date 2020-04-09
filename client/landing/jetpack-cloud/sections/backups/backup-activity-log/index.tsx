/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getHttpData } from 'state/data-layer/http-data';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs, getRequestActivityLogsId } from 'state/data-getters';
import { updateFilter } from 'state/activity-log/actions';
import ActivityCardList from 'landing/jetpack-cloud/components/activity-card-list';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';

const BackupActivityLogPage: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const filter = useSelector( state => getActivityLogFilter( state, siteId ) );
	const logs = useSelector( () => getHttpData( getRequestActivityLogsId( siteId, filter ) ).data );

	// when we load this page clear the filter
	useEffect( () => {
		dispatch( updateFilter( siteId, { page: 1 } ) );
	}, [ dispatch, siteId ] );

	// when the filter changes, re-request the logs
	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );
	return (
		<div>
			<h3>{ translate( 'Find a backup or restore point' ) }</h3>
			<p>
				{ translate(
					'This is the complete event history for your site. Filter by date range and/or activity type.'
				) }
			</p>
			{ logs && <ActivityCardList logs={ logs } pageSize={ 10 } /> }
		</div>
	);
};

export default BackupActivityLogPage;
