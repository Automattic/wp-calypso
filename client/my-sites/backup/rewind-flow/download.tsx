import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import QueryRewindBackupStatus from 'calypso/components/data/query-rewind-backup-status';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { useDispatch, useSelector } from 'calypso/state';
import { getRewindBackupProgress, rewindBackup } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getBackupProgress from 'calypso/state/selectors/get-backup-progress';
import getRequest from 'calypso/state/selectors/get-request';
import getRequestedBackup from 'calypso/state/selectors/get-requested-backup';
import isGranularBackupDownloadRequested from 'calypso/state/selectors/is-granular-backup-download-requested';
import Error from './error';
import Loading from './loading';
import ProgressBar from './progress-bar';
import RewindConfigEditor from './rewind-config-editor';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';
import CheckYourEmail from './rewind-flow-notice/check-your-email';
import { defaultRewindConfig, RewindConfig } from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface Props {
	backupDisplayDate: string;
	rewindId: string;
	siteId: number;
	siteUrl: string;
}

// Future Work: Centralize typing
interface BackupProgress {
	downloadId: number;
	progress?: number;
	rewindId: string;
	url?: string;
	bytesFormatted: string;
}

const BackupDownloadFlow: FunctionComponent< Props > = ( {
	backupDisplayDate,
	rewindId,
	siteId,
	siteUrl,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ userRequestedDownload, setUserRequestedDownload ] = useState( false );
	const [ rewindConfig, setRewindConfig ] = useState< RewindConfig >( defaultRewindConfig );

	const backupProgress = useSelector( ( state ) =>
		getBackupProgress( state, siteId )
	) as BackupProgress | null;

	const requestedBackup = useSelector( ( state ) => getRequestedBackup( state, siteId ) );

	const downloadId = backupProgress?.downloadId;
	const downloadUrl = backupProgress?.url;
	const downloadSize = backupProgress?.bytesFormatted;
	const downloadProgress =
		backupProgress && backupProgress.progress !== undefined && ! isNaN( backupProgress.progress )
			? backupProgress.progress
			: undefined;
	const downloadRewindId = backupProgress?.rewindId;
	const downloadInfoRequest = useSelector( ( state ) =>
		getRequest( state, getRewindBackupProgress( siteId ) )
	);

	const isGranularRestore = useSelector( ( state ) =>
		isGranularBackupDownloadRequested( state, siteId )
	);

	const requestDownload = useCallback(
		() => dispatch( rewindBackup( siteId, rewindId, rewindConfig ) ),
		[ dispatch, rewindConfig, rewindId, siteId ]
	);
	const trackedRequestDownload = useTrackCallback(
		requestDownload,
		'calypso_jetpack_backup_download_click'
	);

	const isDownloadInfoRequestComplete = downloadInfoRequest?.hasLoaded;
	const isOtherDownloadInfo =
		downloadRewindId !== rewindId || ( downloadId !== 0 && requestedBackup !== downloadId );
	const isOtherDownloadInProgress = isOtherDownloadInfo && downloadProgress !== undefined;
	const isDownloadURLNotReady = downloadUrl === undefined || downloadUrl === '';

	useEffect( () => {
		if ( ! isDownloadURLNotReady ) {
			dispatch( recordTracksEvent( 'calypso_jetpack_backup_download_ready' ) );
		}
	}, [ isDownloadURLNotReady, dispatch ] );

	const renderConfirm = () => (
		<>
			<div className="rewind-flow__header">
				<img
					src="/calypso/images/illustrations/jetpack-cloud-download-ready.svg"
					alt="jetpack cloud download ready"
				/>
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Create downloadable backup' ) }</h3>
			<p className="rewind-flow__info">
				{ translate(
					'{{strong}}%(backupDisplayDate)s{{/strong}} is the selected point to create a downloadable backup. ',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<h4 className="rewind-flow__cta">
				{ translate( 'Choose the items you wish to include in the download:' ) }
			</h4>
			<RewindConfigEditor currentConfig={ rewindConfig } onConfigChange={ setRewindConfig } />
			<RewindFlowNotice
				gridicon="notice-outline"
				title={ translate( 'More info' ) }
				type={ RewindFlowNoticeLevel.NOTICE }
				link="https://jetpack.com/support/backup"
			/>
			<Button
				className="rewind-flow__primary-button"
				primary
				onClick={ trackedRequestDownload }
				disabled={
					isOtherDownloadInProgress ||
					Object.values( rewindConfig ).every( ( setting ) => ! setting )
				}
				busy={ isOtherDownloadInProgress }
			>
				{ isOtherDownloadInProgress
					? translate( 'Another downloadable file is being created' )
					: translate( 'Create downloadable file' ) }
			</Button>
		</>
	);

	const renderInProgress = ( percent: number ) => (
		<>
			<div className="rewind-flow__header">
				<img
					src="/calypso/images/illustrations/jetpack-cloud-download-ready.svg"
					alt="jetpack cloud download ready"
				/>
			</div>
			<h3 className="rewind-flow__title">
				{ translate( 'Currently creating a downloadable backup of your site' ) }
			</h3>
			<ProgressBar
				isReady={ ! isDownloadURLNotReady }
				percent={ percent }
				initializationMessage={ translate( 'Initializing the download process' ) }
			/>
			<p className="rewind-flow__info">
				{ translate(
					"We're creating a downloadable backup of your site from {{strong}}%(backupDisplayDate)s{{/strong}}.",
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<CheckYourEmail
				message={ translate( "For your convenience, we'll email you when your file is ready." ) }
			/>
		</>
	);

	const getReadyCopy = () =>
		userRequestedDownload
			? translate(
					'We successfully created a backup of your site from {{strong}}%(backupDisplayDate)s{{/strong}}.',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
			  )
			: translate(
					'We successfully retrieved a backup of your site from {{strong}}%(backupDisplayDate)s{{/strong}}.',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
			  );

	const trackFileDownload = useTrackCallback( noop, 'calypso_jetpack_backup_file_download' );
	const renderReady = () => (
		<>
			<div className="rewind-flow__header">
				<img
					src="/calypso/images/illustrations/jetpack-cloud-download-success.svg"
					alt="jetpack cloud download success"
				/>
			</div>
			<h3 className="rewind-flow__title">
				{ translate( 'Your backup is now available for download.' ) }
			</h3>
			<p className="rewind-flow__info">{ getReadyCopy() }</p>
			<Button
				href={ downloadUrl }
				primary
				className="rewind-flow__primary-button"
				onClick={ trackFileDownload }
			>
				{ translate( 'Download file' ) } ({ downloadSize })
			</Button>
			<CheckYourEmail
				message={ translate(
					"For your convenience, we've emailed you a link to your downloadable backup file."
				) }
			/>
		</>
	);

	const renderError = () => (
		<Error
			siteUrl={ siteUrl }
			errorText={ translate( 'Download failed: %s', {
				args: [ backupDisplayDate ],
				comment: '%s is a time/date string',
			} ) }
		>
			<p className="rewind-flow__info">
				{ translate(
					'An error occurred while creating your downloadable backup. Please {{button}}try your download again{{/button}} or contact our support team to resolve the issue.',
					{
						components: {
							button: (
								<Button
									className="rewind-flow__error-retry-button"
									onClick={ trackedRequestDownload }
								/>
							),
						},
					}
				) }
			</p>
		</Error>
	);

	const render = () => {
		if ( ! isDownloadInfoRequestComplete ) {
			return <Loading />;
		} else if (
			( isOtherDownloadInfo && ! isGranularRestore ) ||
			( downloadProgress === undefined && isDownloadURLNotReady )
		) {
			return renderConfirm();
		} else if ( downloadProgress !== undefined && isDownloadURLNotReady ) {
			if ( ! userRequestedDownload ) {
				setUserRequestedDownload( true );
			}
			return renderInProgress( downloadProgress );
		} else if ( ! isDownloadURLNotReady ) {
			return renderReady();
		}
		return renderError();
	};

	return (
		<>
			<QueryRewindBackupStatus
				downloadId={ downloadProgress !== undefined ? downloadId : undefined }
				siteId={ siteId }
			/>
			<Card>{ render() }</Card>
		</>
	);
};

export default BackupDownloadFlow;
