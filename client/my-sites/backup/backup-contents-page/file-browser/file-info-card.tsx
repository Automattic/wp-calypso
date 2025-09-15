import { fetchBackupExtensionUrl, fetchBackupFileUrl } from '@automattic/api-core';
import {
	Card,
	Button,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { PREPARE_DOWNLOAD_STATUS } from './constants';
import { useFileBrowserContext } from './file-browser-context';
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
	siteSlug: string;
	hasCredentials?: boolean;
	isRestoreEnabled?: boolean;
	onTrackEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	onRequestGranularRestore: ( siteSlug: string, rewindId: number ) => void;
}

function FileInfoCard( {
	siteId,
	item,
	rewindId,
	parentItem,
	path,
	siteSlug,
	hasCredentials,
	isRestoreEnabled,
	onTrackEvent,
	onRequestGranularRestore,
}: FileInfoCardProps ) {
	const dispatch = useDispatch();
	const { fileBrowserState, locale } = useFileBrowserContext();
	const { setNodeCheckState } = fileBrowserState;

	const {
		isSuccess,
		isLoading,
		isError,
		data: fileInfo,
	} = useBackupPathInfoQuery(
		siteId,
		item.period ?? '',
		item.manifestPath ?? '',
		item.extensionType ?? ''
	);

	// Dispatch an error notice if the download could not be prepared
	const handlePrepareDownloadError = useCallback( () => {
		dispatch( onPreparingDownloadError() );
	}, [ dispatch ] );

	const { prepareDownload, prepareDownloadStatus, downloadUrl } = usePrepareDownload(
		siteId,
		handlePrepareDownloadError
	);

	const modifiedTime = fileInfo?.mtime
		? new Intl.DateTimeFormat( locale, {
				dateStyle: 'medium',
				timeStyle: 'short',
		  } ).format( new Date( fileInfo.mtime * 1000 ) )
		: null;
	const size = fileInfo?.size !== undefined ? convertBytes( fileInfo.size ) : null;

	const [ isProcessingDownload, setIsProcessingDownload ] = useState< boolean >( false );

	const handleDownloadError = useCallback( () => {
		setIsProcessingDownload( false );
		dispatch( onProcessingDownloadError() );
	}, [ dispatch ] );

	const trackDownloadByType = useCallback(
		( fileType: string ) => {
			onTrackEvent( 'calypso_jetpack_backup_browser_download', {
				file_type: fileType,
			} );

			return;
		},
		[ onTrackEvent ]
	);

	const triggerFileDownload = useCallback( ( fileUrl: string ) => {
		const link = document.createElement( 'a' );
		link.href = fileUrl;
		link.click();
	}, [] );

	const downloadFile = useCallback( () => {
		setIsProcessingDownload( true );

		if ( item.type !== 'archive' && item.period && item.manifestPath ) {
			const manifestPath = encodeToBase64( ( item.manifestPath as string ) ?? '' );
			fetchBackupFileUrl( siteId, item.period, manifestPath )
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
			if ( ! fileInfo || ! parentItem || ! parentItem.extensionVersion ) {
				handleDownloadError();
				return;
			}

			let archiveType: string;
			if ( fileInfo.dataType === 2 ) {
				archiveType = 'plugin';
			} else {
				archiveType = 'theme';
			}

			fetchBackupExtensionUrl(
				siteId,
				Math.round( rewindId ).toString(),
				archiveType,
				parentItem.name,
				parentItem.extensionVersion
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
		setNodeCheckState( '/', 'unchecked' );

		// Mark this file as selected
		setNodeCheckState( path, 'checked' );

		// Request granular restore
		onRequestGranularRestore( siteSlug, rewindId );

		// Tracks restore interest
		onTrackEvent( 'calypso_jetpack_backup_browser_restore_single_file', {
			file_type: item.type,
			...( hasCredentials !== undefined && { has_credentials: hasCredentials } ),
		} );
	}, [
		setNodeCheckState,
		path,
		onRequestGranularRestore,
		siteSlug,
		rewindId,
		onTrackEvent,
		item.type,
		hasCredentials,
	] );

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

	if ( isLoading ) {
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
			isBusy={ isProcessingDownload }
			variant="secondary"
		>
			{ isProcessingDownload ? __( 'Preparing' ) : __( 'Download file' ) }
		</Button>
	);

	const downloadWordPressButton = (
		<Button
			className="file-card__action"
			href={ fileInfo.downloadUrl }
			onClick={ () => trackDownloadByType( item.type ) }
			variant="secondary"
		>
			{ __( 'Download file' ) }
		</Button>
	);

	const prepareDownloadButton = (
		<Button
			className="file-card__action"
			onClick={ prepareDownloadClick }
			disabled={ isProcessingDownload }
			isBusy={ isProcessingDownload }
			variant="secondary"
		>
			{ isProcessingDownload ? __( 'Preparing' ) : __( 'Prepare and download' ) }
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

	const FileDetail = ( { label, value }: { label: string; value: string | number } ) => {
		return (
			<div className="file-card__detail">
				<Text weight={ 700 }>{ label } </Text>
				<Text>{ value }</Text>
			</div>
		);
	};

	return (
		<Card isRounded={ false } variant="secondary" isBorderless>
			<CardBody>
				<VStack>
					<VStack spacing={ 0 }>
						{ item.type === 'table' && (
							<FileDetail
								label={
									/* translators: This refers to database table rows. */
									__( 'Rows:' )
								}
								value={ item.rowCount ?? 0 }
							/>
						) }

						<HStack justify="space-between">
							{ modifiedTime && (
								<FileDetail
									label={
										/* translators: This refers to the date when the file was modified. */
										__( 'Modified:' )
									}
									value={ modifiedTime }
								/>
							) }

							{ size && (
								<FileDetail
									label={
										/* translators: This refers to the file size (bytes, kilobytes, gigabytes, etc.). */
										__( 'Size:' )
									}
									value={ `${ size.unitAmount } ${ size.unit }` }
								/>
							) }
						</HStack>

						{ fileInfo?.hash && (
							<FileDetail
								label={
									/* translators: This refers to a unique identifier or checksum. */
									__( 'Hash:' )
								}
								value={ fileInfo.hash }
							/>
						) }
					</VStack>

					{ showActions && (
						<HStack justify="flex-start" spacing={ 4 }>
							{ renderDownloadButton() }
							{ item.type !== 'wordpress' && (
								<Button disabled={ ! isRestoreEnabled } onClick={ restoreFile } variant="secondary">
									{ __( 'Restore' ) }
								</Button>
							) }
						</HStack>
					) }

					{ fileInfo?.size !== undefined && fileInfo.size > 0 && (
						<FilePreview item={ item } siteId={ siteId } onTrackEvent={ onTrackEvent } />
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

export default FileInfoCard;
