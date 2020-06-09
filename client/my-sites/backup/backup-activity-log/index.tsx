/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import isEqual from 'lodash/isEqual';
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { getHttpData } from 'state/data-layer/http-data';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs, getRequestActivityLogsId } from 'state/data-getters';
import { setFilter } from 'state/activity-log/actions';
import ActivityCardList from 'components/jetpack/activity-card-list';
import DocumentHead from 'components/data/document-head';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SidebarNavigation from 'my-sites/sidebar-navigation';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	after?: string;
	before?: string;
	group?: string;
	page?: string;
}

const BackupActivityLogPage: FunctionComponent< Props > = ( {
	after,
	before,
	group,
	page = 1,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const logs = useSelector( () => getHttpData( getRequestActivityLogsId( siteId, filter ) ).data );

	/*
	 * When we load this page if the filter has a difference from the current filter that indicates we have navigate to the URL fresh
	 * ( the filterbar makes modifications to the filter in state THEN navigates to the new page. )
	 * Since we are loading this page fresh we want to "reset" the filter to what the query args tell us
	 */
	useEffect( () => {
		const processedGroup = group ? group.split( ',' ) : undefined;
		if (
			! isEqual( filter.group, processedGroup ) ||
			filter.after !== after ||
			filter.before !== before ||
			filter.page !== page
		)
			dispatch( setFilter( siteId, { page: page, after, before, group: processedGroup } ) );
	}, [
		after,
		before,
		dispatch,
		filter.after,
		filter.before,
		filter.group,
		filter.page,
		group,
		page,
		siteId,
	] );

	// when the filter changes, re-request the logs
	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );

	return (
		<Main className="backup-activity-log">
			<DocumentHead title={ translate( 'Activity log' ) } />
			<SidebarNavigation />
			<PageViewTracker path="/backup/activity/:site" title="Activity log" />
			<div className="backup-activity-log__content">
				<div className="backup-activity-log__header">
					<h2>{ translate( 'Find a backup or restore point' ) }</h2>
					<p>
						{ translate(
							'This is the complete event history for your site. Filter by date range and/or activity type.'
						) }
					</p>
				</div>
				{ logs && <ActivityCardList logs={ logs } pageSize={ 10 } /> }
			</div>
		</Main>
	);
};

export default BackupActivityLogPage;
