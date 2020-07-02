/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import classNames from 'classnames';
import React, { FunctionComponent, useEffect } from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import QuerySitePlans from 'components/data/query-site-plans';
import { isFreePlan } from 'lib/plans';
import { getHttpData } from 'state/data-layer/http-data';
import { requestActivityLogs, getRequestActivityLogsId } from 'state/data-getters';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import ActivityCardList from 'components/activity-card-list';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import isVipSite from 'state/selectors/is-vip-site';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SidebarNavigation from 'my-sites/sidebar-navigation';

/**
 * Style dependencies
 */
import './style.scss';

const ActivityLogV2: FunctionComponent = () => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const logs = useSelector( () => getHttpData( getRequestActivityLogsId( siteId, filter ) ).data );
	const siteIsOnFreePlan = useSelector(
		( state ) =>
			isFreePlan( get( getCurrentPlan( state, siteId ), 'productSlug' ) ) &&
			! isVipSite( state, siteId )
	);

	const showFilter = ! siteIsOnFreePlan;

	// when the filter changes, re-request the logs
	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );

	return (
		<Main
			className={ classNames( 'activity-log-v2', {
				wordpressdotcom: ! isJetpackCloud(),
			} ) }
			wideLayout={ ! isJetpackCloud() }
		>
			{ siteId && <QuerySitePlans siteId={ siteId } /> }
			<DocumentHead title={ translate( 'Activity log' ) } />
			<SidebarNavigation />
			<PageViewTracker path="/activity-log/:site" title="Activity log" />
			{ isJetpackCloud() ? (
				<div className="activity-log-v2__header">
					<h2>{ translate( 'Find a backup or restore point' ) }</h2>
					<p>
						{ translate(
							'This is the complete event history for your site. Filter by date range and/or activity type.'
						) }
					</p>
				</div>
			) : (
				<FormattedHeader
					headerText="Activity"
					subHeaderText={ translate(
						'This is the complete event history for your site. Filter by date range and/or activity type.'
					) }
					align="left"
				/>
			) }
			<div className="activity-log-v2__content">
				<ActivityCardList logs={ logs } pageSize={ 10 } showFilter={ showFilter } />
			</div>
		</Main>
	);
};

export default ActivityLogV2;
