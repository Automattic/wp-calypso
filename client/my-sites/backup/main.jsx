/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import page from 'page';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DocumentHead from 'calypso/components/data/document-head';
import QueryRewindCapabilities from 'calypso/components/data/query-rewind-capabilities';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { useDateWithOffset } from './hooks';
import { backupMainPath } from './paths';
import DatePicker from './date-picker';
import EnableRestoresBanner from './enable-restores-banner';
import SearchResults from './search-results';
import { DailyStatus, RealtimeStatus } from './status';
import {
	DailyStatus as DailyStatusSimplifiedI4,
	RealtimeStatus as RealtimeStatusSimplifiedI4,
} from './status/simplified-i4';

/**
 * Style dependencies
 */
import './style.scss';

const isCurrentUserAdmin = ( state, siteId ) => canCurrentUser( state, siteId, 'manage_options' );

const BackupPage = ( { queryDate } ) => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isAdmin = useSelector( ( state ) => isCurrentUserAdmin( state, siteId ) );

	const moment = useLocalizedMoment();
	const parsedQueryDate = queryDate ? moment( queryDate, INDEX_FORMAT ) : moment();
	const selectedDate = useDateWithOffset( parsedQueryDate );

	return (
		<div
			className={ classNames( 'backup__page', {
				wordpressdotcom: ! isJetpackCloud(),
			} ) }
		>
			<Main
				className={ classNames( {
					is_jetpackcom: isJetpackCloud(),
				} ) }
			>
				<SidebarNavigation />
				<TimeMismatchWarning siteId={ siteId } />
				{ ! isJetpackCloud() && (
					<FormattedHeader headerText="Jetpack Backup" align="left" brandFont />
				) }

				{ isAdmin ? (
					<AdminContent selectedDate={ selectedDate } />
				) : (
					<EmptyContent
						illustration="/calypso/images/illustrations/illustration-404.svg"
						title={ translate( 'You are not authorized to view this page' ) }
					/>
				) }
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

const AdminContent = ( { selectedDate } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const activityLogFilter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const isFiltering = ! isFilterEmpty( activityLogFilter );

	const needCredentials = useSelector( ( state ) => getDoesRewindNeedCredentials( state, siteId ) );

	const onSelectDate = ( date ) =>
		page( backupMainPath( siteSlug, { date: date.format( INDEX_FORMAT ) } ) );

	return (
		<>
			<QueryRewindCapabilities siteId={ siteId } />
			<QueryRewindState siteId={ siteId } />

			{ isFiltering && <SearchResults /> }

			{ ! isFiltering && (
				<>
					<DocumentHead title={ translate( 'Latest backups' ) } />
					<PageViewTracker path="/backup/:site" title="Backups" />

					<div className="backup__main-wrap">
						<div className="backup__last-backup-status">
							{ needCredentials && <EnableRestoresBanner /> }

							<DatePicker onSelectDate={ onSelectDate } selectedDate={ selectedDate } />
							<BackupStatus selectedDate={ selectedDate } />
						</div>
					</div>
				</>
			) }
		</>
	);
};

const BackupStatus = ( { selectedDate } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const rewindCapabilities = useSelector( ( state ) => getRewindCapabilities( state, siteId ) );

	if ( ! isArray( rewindCapabilities ) ) {
		return <BackupPlaceholder showDatePicker={ false } />;
	}

	const hasRealtimeBackups = rewindCapabilities.includes( 'backup-realtime' );

	if ( isEnabled( 'jetpack/backup-simplified-screens-i4' ) ) {
		return hasRealtimeBackups ? (
			<RealtimeStatusSimplifiedI4 selectedDate={ selectedDate } />
		) : (
			<DailyStatusSimplifiedI4 selectedDate={ selectedDate } />
		);
	}

	return hasRealtimeBackups ? (
		<RealtimeStatus selectedDate={ selectedDate } />
	) : (
		<DailyStatus selectedDate={ selectedDate } />
	);
};

export default BackupPage;
