import { WPCOM_FEATURES_FULL_ACTIVITY_LOG } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';
import ActivityCardList from 'calypso/components/activity-card-list';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Upsell from 'calypso/components/jetpack/upsell';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { backupClonePath } from 'calypso/my-sites/backup/paths';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getSettingsUrl from 'calypso/state/selectors/get-settings-url';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
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

	const siteHasFullActivityLog = useSelector(
		( state ) => siteId && siteHasFeature( state, siteId, WPCOM_FEATURES_FULL_ACTIVITY_LOG )
	);
	const settingsUrl = useSelector( ( state ) => getSettingsUrl( state, siteId, 'general' ) );

	const jetpackCloudHeader = siteHasFullActivityLog ? (
		<div className="activity-log-v2__header">
			<div className="activity-log-v2__header-left">
				<div className="activity-log-v2__header-title">{ translate( 'Activity log' ) }</div>
				<div className="activity-log-v2__header-text">
					{ translate( 'This is the complete event history for your site' ) }
				</div>
			</div>
			<div className="activity-log-v2__header-right">
				{ isJetpackCloud() && selectedSiteSlug && (
					<Tooltip
						text={ translate(
							'To test your site changes, migrate or keep your data safe in another site'
						) }
					>
						<Button
							className="activity-log-v2__clone-button"
							href={ backupClonePath( selectedSiteSlug ) }
							onClick={ () =>
								dispatch( recordTracksEvent( 'calypso_jetpack_activity_log_copy_site' ) )
							}
						>
							{ translate( 'Copy this site' ) }
						</Button>
					</Tooltip>
				) }
			</div>
		</div>
	) : (
		<Upsell
			headerText={ translate( 'Activity Log' ) }
			bodyText={ preventWidows(
				translate(
					'You currently have access to the 20 most recent events. Upgrade to Jetpack ' +
						'VaultPress Backup or Jetpack Security to unlock more powerful features. ' +
						'You can access all site activity for the last 30 days and filter events ' +
						'by type and date range to quickly find the information you need.'
				)
			) }
			buttonLink={ `https://cloud.jetpack.com/pricing/${ selectedSiteSlug }` }
			buttonText={ translate( 'Upgrade Now' ) }
			onClick={ () =>
				dispatch( recordTracksEvent( 'calypso_jetpack_activity_log_upgrade_click' ) )
			}
			openButtonLinkOnNewTab={ false }
		/>
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
			{ isJetpackCloud() && <SidebarNavigation /> }
			<PageViewTracker path="/activity-log/:site" title="Activity log" />
			{ settingsUrl && <TimeMismatchWarning siteId={ siteId } settingsUrl={ settingsUrl } /> }
			{ isJetpackCloud() ? (
				jetpackCloudHeader
			) : (
				<NavigationHeader
					title={ translate( 'Activity' ) }
					subtitle={ translate(
						'This is the complete event history for your site. Filter by date range and/or activity type.'
					) }
				/>
			) }
			<div className="activity-log-v2__content">
				<ActivityCardList logs={ logs } pageSize={ 10 } showFilter={ siteHasFullActivityLog } />
			</div>
		</Main>
	);
};

export default ActivityLogV2;
