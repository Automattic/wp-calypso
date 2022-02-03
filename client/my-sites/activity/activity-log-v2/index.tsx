import { isFreePlan } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';
import ActivityCardList from 'calypso/components/activity-card-list';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import Upsell from 'calypso/components/jetpack/upsell';
import Main from 'calypso/components/main';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	siteHasBackupProductPurchase,
	siteHasScanProductPurchase,
} from 'calypso/state/purchases/selectors';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getSettingsUrl from 'calypso/state/selectors/get-settings-url';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { FunctionComponent } from 'react';

import './style.scss';

const ActivityLogV2: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const { data: logs } = useActivityLogQuery( siteId, filter );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteIsOnFreePlan = useSelector(
		( state ) =>
			siteId &&
			isFreePlan( get( getCurrentPlan( state, siteId ), 'productSlug' ) ) &&
			! isVipSite( state, siteId )
	);
	const siteHasBackupPurchase = useSelector(
		( state ) => siteId && siteHasBackupProductPurchase( state, siteId )
	);
	const siteHasScanPurchase = useSelector(
		( state ) => siteId && siteHasScanProductPurchase( state, siteId )
	);
	const settingsUrl = useSelector( ( state ) => getSettingsUrl( state, siteId, 'general' ) );

	const showUpgrade = siteIsOnFreePlan && ! siteHasBackupPurchase && ! siteHasScanPurchase;
	const showFilter = ! showUpgrade;

	const jetpackCloudHeader = showUpgrade ? (
		<Upsell
			headerText={ translate( 'Activity Log' ) }
			bodyText={ translate(
				'With your free plan, you can monitor the 20 most recent events. A paid plan unlocks more powerful features. You can access all site activity for the last 30 days and filter events by type and date range to quickly find the information you need. '
			) }
			buttonLink={ `https://cloud.jetpack.com/pricing/${ selectedSiteSlug }` }
			buttonText={ translate( 'Upgrade Now' ) }
			onClick={ () =>
				dispatch( recordTracksEvent( 'calypso_jetpack_activity_log_upgrade_click' ) )
			}
			openButtonLinkOnNewTab={ false }
		/>
	) : (
		<div className="activity-log-v2__header">
			<h2>{ translate( 'Find a backup or restore point' ) }</h2>
			<p>
				{ translate(
					'This is the complete event history for your site. Filter by date range and/or activity type.'
				) }
			</p>
		</div>
	);

	return (
		<Main
			className={ classNames( 'activity-log-v2', {
				wordpressdotcom: ! isJetpackCloud(),
			} ) }
			wideLayout={ ! isJetpackCloud() }
		>
			{ siteId && <QuerySitePlans siteId={ siteId } /> }
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			<DocumentHead title={ translate( 'Activity log' ) } />
			<SidebarNavigation />
			<PageViewTracker path="/activity-log/:site" title="Activity log" />
			{ settingsUrl && <TimeMismatchWarning siteId={ siteId } settingsUrl={ settingsUrl } /> }
			{ isJetpackCloud() ? (
				jetpackCloudHeader
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
