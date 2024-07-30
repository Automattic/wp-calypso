import page from '@automattic/calypso-router';
import { Button, Spinner } from '@automattic/components';
import { useCallback, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useEffect } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { hasJetpackCredentials } from 'calypso/state/jetpack/credentials/selectors';
import { setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import canRestoreSite from 'calypso/state/rewind/selectors/can-restore-site';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { backupGranularRestorePath } from '../../paths';
import { PREPARE_DOWNLOAD_STATUS } from './constants';
import FilePreview from './file-preview';
import {
	onPreparingDownloadError,
	onProcessingDownloadError,
	onRetrievingFileInfoError,
} from './notices';
import { FileBrowserItem } from './types';
import { useBackupPathInfoQuery } from './use-backup-path-info-query';
import { usePrepareDownload } from './use-prepare-download';
import { encodeToBase64, convertBytes } from './util';

interface FileInfoCardProps {
	siteId: number;
	item: FileBrowserItem;
	rewindId: number;
	parentItem?: FileBrowserItem; // This is used to pass the extension details to the child node
	path: string;
}

const FileInfoCard: FunctionComponent< FileInfoCardProps > = ( {
	siteId,
	item,
	rewindId,
	parentItem,
	path,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();

	const {
		isSuccess,
		isInitialLoading,
		isError,
		data: fileInfo,
	} = useBackupPathInfoQuery(
		siteId,
		item.period ?? '',
		item.manifestPath ?? '',
		item.extensionType ?? ''
	);

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	const isRestoreDisabled = useSelector( ( state ) => ! canRestoreSite( state, siteId ) );
	const hasCredentials = useSelector( ( state ) => hasJetpackCredentials( state, siteId ) );

	// Dispatch an error notice if the download could not be prepared
	const handlePrepareDownloadError = useCallback( () => {
		dispatch( onPreparingDownloadError() );
	}, [ dispatch ] );

	const { prepareDownload, prepareDownloadStatus, downloadUrl } = usePrepareDownload(
		siteId,
		handlePrepareDownloadError
	);

	const modifiedTime = fileInfo?.mtime ? moment.unix( fileInfo.mtime ).format( 'lll' ) : null;
	const size = fileInfo?.size !== undefined ? convertBytes( fileInfo.size ) : null;

	const [ isProcessingDownload, setIsProcessingDownload ] = useState< boolean >( false );

	const handleDownloadError = useCallback( () => {
		setIsProcessingDownload( false );
		dispatch( onProcessingDownloadError() );
	}, [ dispatch ] );

	const trackDownloadByType = useCallback(
		( fileType: string ) => {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_backup_browser_download', {
					file_type: fileType,
				} )
			);

			return;
		},
		[ dispatch ]
	);

	const triggerFileDownload = useCallback( ( fileUrl: string ) => {
		const link = document.createElement( 'a' );
		link.href = fileUrl;
		link.click();
	}, [] );

	const downloadFile = useCallback( () => {
		setIsProcessingDownload( true );

		if ( item.type !== 'archive' ) {
			const manifestPath = encodeToBase64( ( item.manifestPath as string ) ?? '' );
			wp.req
				.get( {
					path: `/sites/${ siteId }/rewind/backup/${ item.period }/file/${ manifestPath }/url`,
					apiNamespace: 'wpcom/v2',
				} )
				.then( ( response: { url: string } ) => {
					if ( ! response.url ) {
						handleDownloadError();
						return;
					}

					const downloadUrl = new URL( response.url );
					downloadUrl.searchParams.append( 'disposition', 'attachment' );
					triggerFileDownload( downloadUrl.toString() );
					setIsProcessingDownload( false );
					trackDownloadByType( item.type );
				} )
				.catch( () => {
					handleDownloadError();
					return;
				} );
		} else {
			if ( fileInfo === undefined || parentItem === undefined ) {
				handleDownloadError();
				return;
			}

			let archiveType: string;
			if ( fileInfo.dataType === 2 ) {
				archiveType = 'plugin';
			} else {
				archiveType = 'theme';
			}

			const period = Math.round( rewindId );

			wp.req
				.post(
					{
						path: `/sites/${ siteId }/rewind/backup/${ period }/extension/${ archiveType }/url`,
						apiNamespace: 'wpcom/v2',
					},
					{
						extension_slug: parentItem.name,
						extension_version: parentItem.extensionVersion,
					}
				)
				.then( ( response: { url: string } ) => {
					if ( ! response.url ) {
						handleDownloadError();
						return;
					}

					triggerFileDownload( response.url );
					setIsProcessingDownload( false );

					trackDownloadByType( archiveType );
				} )
				.catch( () => {
					handleDownloadError();
					return;
				} );
		}
	}, [
		fileInfo,
		handleDownloadError,
		item,
		parentItem,
		rewindId,
		siteId,
		trackDownloadByType,
		triggerFileDownload,
	] );

	const prepareDownloadClick = useCallback( () => {
		if ( ! item.period || ! fileInfo?.manifestFilter || ! fileInfo?.dataType ) {
			dispatch( onPreparingDownloadError() );
			return;
		}

		prepareDownload( siteId, item.period, fileInfo.manifestFilter, fileInfo.dataType );
	}, [ dispatch, fileInfo, item.period, prepareDownload, siteId ] );

	const restoreFile = useCallback( () => {
		// Reset checklist
		dispatch( setNodeCheckState( siteId, '/', 'unchecked' ) );

		// Mark this file as selected
		dispatch( setNodeCheckState( siteId, path, 'checked' ) );

		// Redirect to granular restore page
		page.redirect( backupGranularRestorePath( siteSlug, rewindId as unknown as string ) );

		// Tracks restore interest
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_browser_restore_single_file', {
				file_type: item.type,
				has_credentials: hasCredentials,
			} )
		);
	}, [ dispatch, hasCredentials, item.type, path, rewindId, siteId, siteSlug ] );

	useEffect( () => {
		if ( prepareDownloadStatus === PREPARE_DOWNLOAD_STATUS.PREPARING ) {
			setIsProcessingDownload( true );
		} else {
			setIsProcessingDownload( false );
		}

		if ( prepareDownloadStatus === PREPARE_DOWNLOAD_STATUS.READY ) {
			if ( downloadUrl === undefined ) {
				handleDownloadError();
				return;
			}

			triggerFileDownload( downloadUrl );
			trackDownloadByType( item.type );
		}
	}, [
		downloadUrl,
		handleDownloadError,
		item,
		prepareDownloadStatus,
		trackDownloadByType,
		triggerFileDownload,
	] );

	// Dispatch an error notice if the file info could not be retrieved
	useEffect( () => {
		if ( isError ) {
			dispatch( onRetrievingFileInfoError() );
		}
	}, [ dispatch, isError ] );

	const showActions =
		item.type !== 'archive' || ( item.type === 'archive' && item.extensionType === 'unchanged' );

	// Do not display file info if the item hasChildren (it could be a directory, plugins, themes, etc.)
	if ( item.hasChildren ) {
		return null;
	}

	if ( isInitialLoading ) {
		return <div className="file-browser-node__loading placeholder" />;
	}

	if ( ! isSuccess ) {
		return null;
	}

	const downloadFileButton = (
		<Button
			className="file-card__action"
			onClick={ downloadFile }
			disabled={ isProcessingDownload }
		>
			{ isProcessingDownload ? <Spinner /> : translate( 'Download file' ) }
		</Button>
	);

	const downloadWordPressButton = (
		<Button
			className="file-card__action"
			href={ fileInfo.downloadUrl }
			onClick={ () => trackDownloadByType( item.type ) }
		>
			{ translate( 'Download file' ) }
		</Button>
	);

	const prepareDownloadButton = (
		<Button
			className="file-card__action"
			onClick={ prepareDownloadClick }
			disabled={ isProcessingDownload }
		>
			{ isProcessingDownload ? (
				<>
					<Spinner className="file-card__prepare-download-spinner" size={ 16 } />
					{ translate( 'Preparing' ) }
				</>
			) : (
				translate( 'Prepare and download' )
			) }
		</Button>
	);

	// Render the download button based on the file type
	const renderDownloadButton = () => {
		if ( item.type === 'wordpress' ) {
			return downloadWordPressButton;
		} else if ( item.type === 'table' ) {
			return prepareDownloadButton;
		}

		return downloadFileButton;
	};

	return (
		<div className="file-card">
			<div className="file-card__details">
				{ item.type === 'table' && (
					<div className="file-card__detail">
						<span className="file-card__label">
							{ translate( 'Rows:', { comment: 'Rows refers to database table rows.' } ) }{ ' ' }
						</span>
						<span className="file-card__value">{ item.rowCount }</span>
					</div>
				) }

				<div className="file-card__detail-group">
					{ modifiedTime && (
						<div className="file-card__detail">
							<span className="file-card__label">
								{ translate( 'Modified:', { comment: 'Date when the file was modified.' } ) }{ ' ' }
							</span>
							<span className="file-card__value">{ modifiedTime }</span>
						</div>
					) }

					{ size && (
						<div className="file-card__detail">
							<span className="file-card__label">
								{ translate( 'Size:', {
									comment: 'This refers to file size (bytes, kilobytes, gigabytes, etc.',
								} ) }{ ' ' }
							</span>
							<span className="file-card__value">
								{ size.unitAmount } { size.unit }
							</span>
						</div>
					) }
				</div>

				{ fileInfo?.hash && (
					<div className="file-card__detail">
						<span className="file-card__label">
							{ translate( 'Hash:', {
								comment: 'This refers to a unique identifier or checksum.',
							} ) }{ ' ' }
						</span>
						<span className="file-card__value">{ fileInfo.hash }</span>
					</div>
				) }
			</div>

			{ showActions && (
				<>
					<div className="file-card__actions">
						{ renderDownloadButton() }
						{ item.type !== 'wordpress' && (
							<Button
								className="file-card__action"
								onClick={ restoreFile }
								disabled={ isRestoreDisabled }
							>
								{ translate( 'Restore' ) }
							</Button>
						) }
					</div>
				</>
			) }

			{ fileInfo?.size !== undefined && fileInfo.size > 0 && (
				<FilePreview item={ item } siteId={ siteId } />
			) }
		</div>
	);
};

export default FileInfoCard;
