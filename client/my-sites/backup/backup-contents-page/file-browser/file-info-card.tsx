import { Button, Spinner } from '@automattic/components';
import { useCallback, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useEffect } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { PREPARE_DOWNLOAD_STATUS } from './constants';
import FilePreview from './file-preview';
import { FileBrowserItem } from './types';
import { useBackupPathInfoQuery } from './use-backup-path-info-query';
import { usePrepareDownload } from './use-prepare-download';
import { convertBytes } from './util';

interface FileInfoCardProps {
	siteId: number;
	item: FileBrowserItem;
}

const FileInfoCard: FunctionComponent< FileInfoCardProps > = ( { siteId, item } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();

	const {
		isSuccess,
		isInitialLoading,
		data: fileInfo,
	} = useBackupPathInfoQuery(
		siteId,
		item.period ?? '',
		item.manifestPath ?? '',
		item.extensionType ?? ''
	);

	const { prepareDownload, prepareDownloadStatus, downloadUrl } = usePrepareDownload( siteId );

	const modifiedTime = fileInfo?.mtime ? moment.unix( fileInfo.mtime ).format( 'lll' ) : null;
	const size = fileInfo?.size !== undefined ? convertBytes( fileInfo.size ) : null;

	const [ isProcessingDownload, setIsProcessingDownload ] = useState< boolean >( false );
	const downloadFile = useCallback( () => {
		setIsProcessingDownload( true );
		const manifestPath = window.btoa( item.manifestPath ?? '' );

		wp.req
			.get( {
				path: `/sites/${ siteId }/rewind/backup/${ item.period }/file/${ manifestPath }/url`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( response: { url: string } ) => {
				const downloadUrl = new URL( response.url );
				downloadUrl.searchParams.append( 'disposition', 'attachment' );
				window.open( downloadUrl, '_blank' );
				setIsProcessingDownload( false );

				dispatch(
					recordTracksEvent( 'calypso_jetpack_backup_browser_download', {
						file_type: item.type,
					} )
				);
			} );
	}, [ siteId, item, dispatch ] );

	const prepareDownloadClick = useCallback( () => {
		if ( ! item.period || ! fileInfo?.manifestFilter || ! fileInfo?.dataType ) {
			// @TODO: We should dispatch an error notice
			return;
		}

		prepareDownload( siteId, item.period, fileInfo.manifestFilter, fileInfo.dataType );
	}, [ fileInfo, item.period, prepareDownload, siteId ] );

	useEffect( () => {
		if ( prepareDownloadStatus === PREPARE_DOWNLOAD_STATUS.PREPARING ) {
			setIsProcessingDownload( true );
		} else {
			setIsProcessingDownload( false );
		}

		if ( prepareDownloadStatus === PREPARE_DOWNLOAD_STATUS.READY ) {
			window.open( downloadUrl, '_blank' );
		}
	}, [ downloadUrl, prepareDownloadStatus ] );

	const showActions = item.type !== 'archive';

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

	const requiresPreparation = item.type === 'table';

	const downloadFileButton = (
		<Button
			className="file-card__action"
			onClick={ downloadFile }
			disabled={ isProcessingDownload }
		>
			{ isProcessingDownload ? <Spinner /> : translate( 'Download file' ) }
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
				<div className="file-card__actions">
					{ requiresPreparation ? prepareDownloadButton : downloadFileButton }
				</div>
			) }

			{ fileInfo?.size !== undefined && fileInfo.size > 0 && (
				<FilePreview item={ item } siteId={ siteId } />
			) }
		</div>
	);
};

export default FileInfoCard;
