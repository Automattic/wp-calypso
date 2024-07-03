import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { arrowLeft, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import ActionButtons from 'calypso/components/jetpack/daily-backup-status/action-buttons';
import cloudIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-success.svg';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import { backupMainPath } from '../paths';
import FileBrowser from './file-browser';
import './style.scss';

interface OwnProps {
	rewindId: number;
	siteId: number;
}

const BackupContentsPage: FunctionComponent< OwnProps > = ( { rewindId, siteId } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const getDisplayDate = useGetDisplayDate();
	const moment = useLocalizedMoment();
	const displayDate = getDisplayDate( moment.unix( rewindId ), false );
	const browserCheckList = useSelector( ( state ) => getBackupBrowserCheckList( state, siteId ) );

	const isMultiSite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_browser_view' ) );
	}, [ dispatch ] );

	return (
		<>
			<QuerySiteCredentials siteId={ siteId } />
			<Main className="backup-contents-page">
				<DocumentHead title={ translate( 'Backup contents' ) } />
				{ isJetpackCloud() && <SidebarNavigation /> }
				<Button
					variant="link"
					className="backup-contents-page__back-button is-borderless"
					href={ backupMainPath( siteSlug ) }
				>
					<Icon icon={ arrowLeft } size={ 16 } /> { translate( 'Go back' ) }
				</Button>
				<Card>
					<div className="backup-contents-page__header daily-backup-status status-card">
						<div className="status-card__message-head">
							<img src={ cloudIcon } alt="" role="presentation" />
							<div className="status-card__title">{ translate( 'Backup contents from:' ) }</div>
						</div>
						<div className="status-card__title">{ displayDate }</div>
						{ browserCheckList.totalItems === 0 && (
							<ActionButtons isMultiSite={ isMultiSite } rewindId={ rewindId.toString() } />
						) }
					</div>
					<div className="backup-contents-page__body">
						<FileBrowser rewindId={ rewindId } />
					</div>
				</Card>
			</Main>
		</>
	);
};

export default BackupContentsPage;
