import { WPCOM_FEATURES_FULL_ACTIVITY_LOG } from '@automattic/calypso-products';
import { Page } from '@wordpress/admin-ui';
import { useTranslate } from 'i18n-calypso';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';
import ActivityCardList from 'calypso/components/activity-card-list';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Upsell from 'calypso/components/jetpack/upsell';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { hasJetpackPartnerAccess as hasJetpackPartnerAccessSelector } from 'calypso/state/partner-portal/partner/selectors';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getActivityLogHiddenGroups from 'calypso/state/selectors/get-activity-log-hidden-groups';
import getSettingsUrl from 'calypso/state/selectors/get-settings-url';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { FunctionComponent } from 'react';

import './style.scss';

const ActivityLogV2: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const isWPCOMSite = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );
	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const notGroup = useSelector( ( state ) => getActivityLogHiddenGroups( state, siteId ) );
	const filterWithNotGroup = notGroup ? { ...filter, notGroup } : filter;
	const { data: logs } = useActivityLogQuery( siteId, filterWithNotGroup );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const hasJetpackPartnerAccess = useSelector( hasJetpackPartnerAccessSelector );

	const siteHasFullActivityLog = useSelector(
		( state ) => siteId && siteHasFeature( state, siteId, WPCOM_FEATURES_FULL_ACTIVITY_LOG )
	);
	const settingsUrl = useSelector( ( state ) => getSettingsUrl( state, siteId, 'general' ) );

	const isJetpackPlatform = isJetpackCloud() || isA8CForAgencies();
	const showHeader = ! isJetpackPlatform;
	const showUpsell = isJetpackPlatform && ! isWPCOMSite && ! siteHasFullActivityLog;

	let upsellURL;
	if ( hasJetpackPartnerAccess && ! isA8CForAgencies() ) {
		upsellURL = `/partner-portal/issue-license?site_id=${ siteId }`;
	} else if ( isA8CForAgencies() ) {
		upsellURL = `/marketplace/products?site_id=${ siteId }`;
	} else {
		upsellURL = `/pricing/${ selectedSiteSlug }`;
	}

	return (
		<Main fullWidthLayout className="activity-log-v2">
			{ siteId && <QuerySitePlans siteId={ siteId } /> }
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			{ siteId && <QuerySiteCredentials siteId={ siteId } /> }
			<DocumentHead title={ translate( 'Activity Log' ) } />
			{ isJetpackCloud() && <SidebarNavigation /> }
			<PageViewTracker path="/activity-log/:site" title="Activity Log" />
			<Page
				hasPadding
				showSidebarToggle={ false }
				title={ showHeader ? <JetpackTitle title={ translate( 'Activity' ) } /> : undefined }
				subTitle={
					showHeader
						? translate(
								'This is the complete event history for your site. Filter by date range and/or activity type.'
						  )
						: undefined
				}
			>
				{ showUpsell && (
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
						buttonLink={ upsellURL }
						buttonText={ translate( 'Upgrade now' ) }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_jetpack_activity_log_upgrade_click' ) )
						}
						openButtonLinkOnNewTab={ false }
					/>
				) }
				{ settingsUrl && <TimeMismatchWarning siteId={ siteId } settingsUrl={ settingsUrl } /> }
				<div className="activity-log-v2__content">
					<ActivityCardList
						logs={ logs }
						pageSize={ 10 }
						showFilter={ siteHasFullActivityLog }
						siteId={ siteId }
					/>
				</div>
			</Page>
		</Main>
	);
};

export default ActivityLogV2;
