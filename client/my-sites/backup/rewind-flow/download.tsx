/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { defaultRewindConfig, RewindConfig } from './types';
import { rewindBackup } from 'state/activity-log/actions';
import CheckYourEmail from './rewind-flow-notice/check-your-email';
import Error from './error';
import getBackupDownloadId from 'state/selectors/get-backup-download-id';
import getBackupDownloadProgress from 'state/selectors/get-backup-download-progress';
import getBackupDownloadUrl from 'state/selectors/get-backup-download-url';
import ProgressBar from './progress-bar';
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';
import RewindConfigEditor from './rewind-config-editor';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';
import useTrackCallback from 'lib/jetpack/use-track-callback';

interface Props {
	backupDisplayDate: string;
	rewindId: string;
	siteId: number;
	siteUrl: string;
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

	const downloadId = useSelector( ( state ) => getBackupDownloadId( state, siteId, rewindId ) );
	const downloadUrl = useSelector( ( state ) => getBackupDownloadUrl( state, siteId, rewindId ) );
	const downloadProgress = useSelector( ( state ) =>
		getBackupDownloadProgress( state, siteId, rewindId )
	);

	const requestDownload = useCallback(
		() => dispatch( rewindBackup( siteId, rewindId, rewindConfig ) ),
		[ dispatch, rewindConfig, rewindId, siteId ]
	);
	const trackedRequestDownload = useTrackCallback(
		requestDownload,
		'calypso_jetpack_backup_download_click'
	);

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
			<h4 className="rewind-flow__cta">{ translate( 'Choose the items you wish to restore:' ) }</h4>
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
				disabled={ Object.values( rewindConfig ).every( ( setting ) => ! setting ) }
			>
				{ translate( 'Create downloadable file' ) }
			</Button>
		</>
	);

	const renderInProgress = () => (
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
			<ProgressBar percent={ downloadProgress } />
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
				{ translate( 'Download file' ) }
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
		if ( downloadProgress === null && downloadUrl === null ) {
			return renderConfirm();
		} else if ( downloadProgress !== null && downloadUrl === null ) {
			if ( ! userRequestedDownload ) {
				setUserRequestedDownload( true );
			}
			return renderInProgress();
		} else if ( downloadUrl !== null ) {
			return renderReady();
		}
		return renderError();
	};

	return (
		<>
			<QueryRewindBackupStatus downloadId={ downloadId } siteId={ siteId } />
			{ render() }
		</>
	);
};

export default BackupDownloadFlow;
