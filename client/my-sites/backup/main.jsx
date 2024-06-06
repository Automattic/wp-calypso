import { WPCOM_FEATURES_REAL_TIME_BACKUPS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { ExternalLink } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';
import BackupStorageSpace from 'calypso/components/backup-storage-space';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackCredentialsStatus from 'calypso/components/data/query-jetpack-credentials-status';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QueryRewindPolicies from 'calypso/components/data/query-rewind-policies';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import InlineSupportLink from 'calypso/components/inline-support-link';
import BackupActionsToolbar from 'calypso/components/jetpack/backup-actions-toolbar';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import isRewindPoliciesInitialized from 'calypso/state/rewind/selectors/is-rewind-policies-initialized';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getSettingsUrl from 'calypso/state/selectors/get-settings-url';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BackupDatePicker from './backup-date-picker';
import BackupsMadeRealtimeBanner from './banners/backups-made-realtime-banner';
import EnableRestoresBanner from './banners/enable-restores-banner';
import { backupMainPath } from './paths';
import SearchResults from './search-results';
import { DailyStatus, RealtimeStatus } from './status';

import './style.scss';

const BackupPage = ( { queryDate } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSettingsUrl = useSelector( ( state ) => getSettingsUrl( state, siteId, 'general' ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );

	const moment = useLocalizedMoment();
	const parsedQueryDate = queryDate ? moment( queryDate, INDEX_FORMAT ) : moment();

	// If a date is specified, it'll be in a timezone-agnostic string format,
	// so we'll need to add the site's TZ info in without affecting the date
	// we were given.
	//
	// Otherwise, if no date is specified, we're talking about the current date.
	// This is the same point in time for everyone, but we should make sure to
	// store it in terms of the selected site's time zone.
	const selectedDate = useDateWithOffset( parsedQueryDate, {
		keepLocalTime: !! queryDate,
	} );

	const supportLink = isAtomic ? (
		<InlineSupportLink supportContext="backups" showIcon={ false } />
	) : (
		<ExternalLink href="https://jetpack.com/support/backup/">Learn more</ExternalLink>
	);

	return (
		<div
			className={ clsx( 'backup__page', {
				wordpressdotcom: ! ( isJetpackCloud() || isA8CForAgencies() ),
			} ) }
		>
			<Main
				className={ clsx( {
					is_jetpackcom: isJetpackCloud(),
				} ) }
			>
				{ isJetpackCloud() && <SidebarNavigation /> }
				<TimeMismatchWarning siteId={ siteId } settingsUrl={ siteSettingsUrl } />
				{ ! ( isJetpackCloud() || isA8CForAgencies() ) && (
					<NavigationHeader
						navigationItems={ [] }
						title={ translate( 'Jetpack VaultPress Backup' ) }
						subtitle={ translate(
							'Restore or download a backup of your site from a specific moment in time. {{learnMoreLink/}}',
							{
								components: {
									learnMoreLink: supportLink,
								},
							}
						) }
					>
						<BackupActionsToolbar siteId={ siteId } />
					</NavigationHeader>
				) }

				<AdminContent selectedDate={ selectedDate } />
			</Main>
		</div>
	);
};

const isFilterEmpty = ( filter ) => {
	if ( ! filter ) {
		return true;
	}

	if ( filter.group || filter.on || filter.before || filter.after ) {
		return false;
	}

	if ( filter.page !== 1 ) {
		return false;
	}

	return true;
};

function AdminContent( { selectedDate } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const activityLogFilter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const isFiltering = ! isFilterEmpty( activityLogFilter );

	const needCredentials = useSelector( ( state ) => getDoesRewindNeedCredentials( state, siteId ) );

	const onDateChange = useCallback(
		( date ) => page( backupMainPath( siteSlug, { date: date.format( INDEX_FORMAT ) } ) ),
		[ siteSlug ]
	);

	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );

	return (
		<>
			<QuerySiteSettings siteId={ siteId } />
			<QuerySiteFeatures siteIds={ [ siteId ] } />
			<QuerySiteCredentials siteId={ siteId } />
			<QueryRewindPolicies
				siteId={ siteId } /* The policies inform the max visible limit for backups */
			/>
			<QueryProductsList type="jetpack" />
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			<QueryRewindState siteId={ siteId } />
			{ ! isAtomic && <QueryJetpackCredentialsStatus siteId={ siteId } role="main" /> }

			{ isFiltering && <SearchResults /> }

			{ ! isFiltering && (
				<>
					<DocumentHead title={ translate( 'Latest backups' ) } />
					<PageViewTracker path="/backup/:site" title="Backups" />

					<BackupStatus
						onDateChange={ onDateChange }
						selectedDate={ selectedDate }
						needCredentials={ needCredentials }
					/>
				</>
			) }
		</>
	);
}

function BackupStatus( { selectedDate, needCredentials, onDateChange } ) {
	const isFetchingSiteFeatures = useSelectedSiteSelector( isRequestingSiteFeatures );
	const isPoliciesInitialized = useSelectedSiteSelector( isRewindPoliciesInitialized );
	const siteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();

	const hasRealtimeBackups = useSelectedSiteSelector(
		siteHasFeature,
		WPCOM_FEATURES_REAL_TIME_BACKUPS
	);

	if ( isFetchingSiteFeatures || ! isPoliciesInitialized ) {
		return <BackupPlaceholder showDatePicker />;
	}

	return (
		<div className="backup__main-wrap">
			<div className="backup__last-backup-status">
				{ ( isJetpackCloud() || isA8CForAgencies() ) && (
					<div className="backup__header">
						<div className="backup__header-left">
							<div className="backup__header-title">{ translate( 'Latest Backups' ) }</div>
							<div className="backup__header-text">
								{ translate( 'This is a list of your latest generated backups' ) }
							</div>
						</div>
						<div className="backup__header-right">
							<BackupActionsToolbar siteId={ siteId } />
						</div>
					</div>
				) }

				{ needCredentials && <EnableRestoresBanner /> }
				{ ! needCredentials && hasRealtimeBackups && <BackupsMadeRealtimeBanner /> }

				<BackupDatePicker onDateChange={ onDateChange } selectedDate={ selectedDate } />
				<BackupStorageSpace />
				{ hasRealtimeBackups ? (
					<RealtimeStatus selectedDate={ selectedDate } />
				) : (
					<DailyStatus selectedDate={ selectedDate } />
				) }
			</div>
		</div>
	);
}

export default BackupPage;
