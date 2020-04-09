/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
// import { emptyFilter } from 'state/activity-log/reducer';
// import { getEventsInDailyBackup } from '../utils';
import { getHttpData } from 'state/data-layer/http-data';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs, getRequestActivityLogsId } from 'state/data-getters';
import { updateFilter } from 'state/activity-log/actions';
import { useApplySiteOffset } from 'landing/jetpack-cloud/components/site-offset';
import { useLocalizedMoment } from 'components/localized-moment';
import ActivityCardList from 'landing/jetpack-cloud/components/activity-card-list';
import BackupDetailSummary from './summary';
import DocumentHead from 'components/data/document-head';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';

const DETAIL_PAGE_SIZE = 10;

interface Props {
	backupId: string;
}

const BackupDetailPage: FunctionComponent< Props > = ( { backupId } ) => {
	const applySiteOffset = useApplySiteOffset();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const filter = useSelector( state => getActivityLogFilter( state, siteId ) );
	const logs = useSelector( () => getHttpData( getRequestActivityLogsId( siteId, filter ) ).data );

	const backupMoment = applySiteOffset( moment( parseFloat( backupId ) * 1000 ) );
	const fromTimestamp = backupMoment?.startOf( 'day' ).toISOString();
	const toTimeStamp = backupMoment?.endOf( 'day' ).toISOString();

	// 	// when we load this page clear the filter, locking it to the date of the backup
	useEffect( () => {
		dispatch( updateFilter( siteId, { page: 1, before: toTimeStamp, after: fromTimestamp } ) );
	}, [ dispatch, fromTimestamp, siteId, toTimeStamp ] );

	//when the filter changes, re-request the logs
	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );

	// const render = () => {
	// 	// const { backupId, filter, logs, moment, siteId, translate } = this.props;
	// 	const { page: requestedPage } = filter;

	const backups = logs && logs.filter( event => event.rewindId === backupId );
	const thisBackup = logs && backups[ 0 ];

	// 	const actualLogs =
	// 		( thisBackup && getEventsInDailyBackup( logs, new Date( thisBackup.activityDate ) ) ) || [];

	// }

	return (
		<Main>
			<DocumentHead title="Backup Details" />
			<SidebarNavigation />
			<div>
				<Gridicon icon="cloud-upload" />
				{ thisBackup &&
					applySiteOffset( moment( thisBackup.activityDate ) )?.format( 'YYYY-MM-DD' ) }
			</div>
			<div>
				<Button primary={ false }>{ translate( 'Download backup' ) }</Button>
				<Button primary={ true }>{ translate( 'Restore to this point' ) }</Button>
			</div>
			{ thisBackup && <BackupDetailSummary thisBackup={ thisBackup } /> }
			{ logs && (
				<ActivityCardList
					showDateRangeSelector={ false }
					logs={ logs }
					pageSize={ DETAIL_PAGE_SIZE }
				/>
			) }
		</Main>
	);
};

export default BackupDetailPage;

// const mapStateToProps = state => {
// 	const siteId = getSelectedSiteId( state );
// 	const logs = siteId && requestActivityLogs( siteId, emptyFilter );
// 	const filter = getActivityLogFilter( state, siteId );

// 	return {
// 		filter,
// 		logs: logs?.data ?? [],
// 		siteId,
// 	};
// };

// const mapDispatchToProps = dispatch => ( {
// 	selectPage: ( siteId, pageNumber ) =>
// } );

// export default connect(
// 	mapStateToProps,
// 	mapDispatchToProps
// )( localize( withLocalizedMoment( BackupDetailPage ) ) );
