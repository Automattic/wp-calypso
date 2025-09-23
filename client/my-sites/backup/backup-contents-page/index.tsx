import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { Button, ExternalLink, __experimentalSpacer as Spacer } from '@wordpress/components';
import { arrowLeft, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import ActionButtons from 'calypso/components/jetpack/daily-backup-status/action-buttons';
import cloudIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-success.svg';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindRequestGranularBackup } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { hasJetpackCredentials } from 'calypso/state/jetpack/credentials/selectors';
import canRestoreSite from 'calypso/state/rewind/selectors/can-restore-site';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import { backupDownloadPath, backupGranularRestorePath, backupMainPath } from '../paths';
import FileBrowser from './file-browser';
import { useFileBrowserContext } from './file-browser/file-browser-context';
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
	const { fileBrowserState } = useFileBrowserContext();
	const browserCheckList = fileBrowserState.getCheckList();
	const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
	const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

	const isMultiSite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;
	const hasCredentials = useSelector( ( state ) => hasJetpackCredentials( state, siteId ) );
	const isRestoreEnabled = useSelector( ( state ) => canRestoreSite( state, siteId ) );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_browser_view' ) );
	}, [ dispatch ] );

	const onLearnAboutClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_browser_learn_about_click' ) );
	}, [ dispatch ] );

	const handleTrackEvent = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	const handleRequestGranularDownload = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_browser_download_multiple_files' ) );
		dispatch( rewindRequestGranularBackup( siteId, rewindId, includePaths, excludePaths ) );
		page.redirect( backupDownloadPath( siteSlug, rewindId.toString() ) );
	}, [ dispatch, siteId, rewindId, siteSlug, includePaths, excludePaths ] );

	const handleRequestGranularRestore = useCallback( ( siteSlug: string, rewindId: number ) => {
		page.redirect( backupGranularRestorePath( siteSlug, rewindId as unknown as string ) );
	}, [] );

	const onGranularRestoreClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_browser_restore_multiple_files', {
				...( hasCredentials !== undefined && {
					has_credentials: hasCredentials,
				} ),
			} )
		);
		handleRequestGranularRestore( siteSlug, rewindId );
	}, [ dispatch, hasCredentials, handleRequestGranularRestore, siteSlug, rewindId ] );

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
							<div className="status-card__header-content">
								<div className="status-card__title">{ translate( 'Backup contents from:' ) }</div>
								<div className="status-card__learn-about">
									<ExternalLink
										href="https://jetpack.com/blog/introducing-backup-file-browser/"
										onClick={ onLearnAboutClick }
									>
										{ translate( 'Learn about the file browser' ) }
									</ExternalLink>
								</div>
							</div>
						</div>
						<div className="status-card__title">{ displayDate }</div>
						<Spacer marginBottom={ 2 }>
							{ fileBrowserState.getCheckList().totalItems === 0 ? (
								<ActionButtons isMultiSite={ isMultiSite } rewindId={ rewindId.toString() } />
							) : (
								<ButtonStack justify="flex-start">
									<Button
										__next40pxDefaultSize
										onClick={ handleRequestGranularDownload }
										variant="secondary"
									>
										{ translate( 'Download selected files' ) }
									</Button>
									<Button
										__next40pxDefaultSize
										onClick={ onGranularRestoreClick }
										disabled={ ! isRestoreEnabled }
										variant="primary"
									>
										{ translate( 'Restore selected files' ) }
									</Button>
								</ButtonStack>
							) }
						</Spacer>
					</div>
					<div className="backup-contents-page__body">
						<FileBrowser
							rewindId={ rewindId }
							siteId={ siteId }
							siteSlug={ siteSlug }
							hasCredentials={ hasCredentials }
							isRestoreEnabled={ isRestoreEnabled }
							onTrackEvent={ handleTrackEvent }
							onRequestGranularRestore={ handleRequestGranularRestore }
						/>
					</div>
				</Card>
			</Main>
		</>
	);
};

export default BackupContentsPage;
