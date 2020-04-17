/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	backupDownloadPath,
	backupRestorePath,
} from 'landing/jetpack-cloud/sections/backups/paths';
import { Button } from '@automattic/components';
import { getHttpData } from 'state/data-layer/http-data';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { requestActivityLogs, getRequestActivityLogsId } from 'state/data-getters';
import { setFilter } from 'state/activity-log/actions';
import {
	useApplySiteOffset,
	applySiteOffsetType,
} from 'landing/jetpack-cloud/components/site-offset';
import { useLocalizedMoment } from 'components/localized-moment';
import ActivityCardList from 'landing/jetpack-cloud/components/activity-card-list';
import BackupDetailSummary from './summary';
import DocumentHead from 'components/data/document-head';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Spinner from 'components/spinner';

const DETAIL_PAGE_SIZE = 10;

interface Props {
	rewindId: string;
}

const BackupDetailPage: FunctionComponent< Props > = ( { rewindId } ) => {
	const applySiteOffset = useApplySiteOffset();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const filter = useSelector( state => getActivityLogFilter( state, siteId ) );
	const logs = useSelector( () => getHttpData( getRequestActivityLogsId( siteId, filter ) ).data );

	// when we load this page update the filter, locking it to the date of the backup
	useEffect( () => {
		// future work: move filter modification functions to utils
		// we need applySiteOffset to figure out what dates we want, so wait until we get it
		if ( applySiteOffset ) {
			const backupMoment = applySiteOffset( moment( parseFloat( rewindId ) * 1000 ) );
			dispatch(
				setFilter( siteId, {
					page: 1,
					before: moment( backupMoment )
						.endOf( 'day' )
						.toISOString(),
					after: moment( backupMoment )
						.startOf( 'day' )
						.toISOString(),
				} )
			);
		}
	}, [ applySiteOffset, dispatch, moment, siteId, rewindId ] );

	//when the filter changes, re-request the logs
	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );

	const render = ( loadedApplySiteOffset: applySiteOffsetType ) => {
		const backupMoment = loadedApplySiteOffset( moment( parseFloat( rewindId ) * 1000 ) );
		const backups = logs && logs.filter( event => event.rewindId === rewindId );
		const thisBackup = backups && backups[ 0 ];

		return (
			<>
				<div>
					<Gridicon icon="cloud-upload" />
					{ backupMoment.format( 'YYYY-MM-DD' ) }
				</div>
				<div>
					<Button primary={ false } href={ siteSlug && backupDownloadPath( siteSlug, rewindId ) }>
						{ translate( 'Download backup' ) }
					</Button>
					<Button primary={ true } href={ siteSlug && backupRestorePath( siteSlug, rewindId ) }>
						{ translate( 'Restore to this point' ) }
					</Button>
				</div>
				{ /* backup summary is hidden when filtered out  */ }
				{ thisBackup && <BackupDetailSummary thisBackup={ thisBackup } /> }
				{ logs && logs.length > 1 ? (
					<ActivityCardList
						showDateRangeSelector={ false }
						logs={ logs }
						pageSize={ DETAIL_PAGE_SIZE }
					/>
				) : (
					<div>{ translate( 'This backup contains no changes.' ) }</div>
				) }
			</>
		);
	};

	return (
		<Main>
			<DocumentHead title="Backup Details" />
			<SidebarNavigation />
			{ applySiteOffset ? render( applySiteOffset ) : <Spinner /> }
		</Main>
	);
};

export default BackupDetailPage;
