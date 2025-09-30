import { fetchBackupExtensionUrl, fetchBackupFileUrl } from '@automattic/api-core';
import {
	Card,
	Button,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { Text } from 'calypso/dashboard/components/text';
import { PREPARE_DOWNLOAD_STATUS } from './constants';
import { useFileBrowserContext } from './file-browser-context';
import FilePreview from './file-preview';
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
	source: 'calypso' | 'dashboard';
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
	source,
	onRequestGranularRestore,
}: FileInfoCardProps ) {
	const { fileBrowserState, locale, notices } = useFileBrowserContext();
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
		notices.showError( __( 'There was an error preparing your download. Please try again.' ) );
	}, [ notices ] );

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
		notices.showError( __( 'There was an error processing your download. Please try again.' ) );
	}, [ notices ] );

	const trackDownloadByType = useCallback(
		( fileType: string ) => {
			const trackingProps = { file_type: fileType };
			if ( source === 'dashboard' ) {
				onTrackEvent( 'calypso_dashboard_backup_browser_download', trackingProps );
			} else {
				onTrackEvent( 'calypso_jetpack_backup_browser_download', trackingProps );
			}

			return;
		},
		[ onTrackEvent, source ]
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
			notices.showError( __( 'There was an error preparing your download. Please try again.' ) );
			return;
		}

		prepareDownload( siteId, item.period, fileInfo.manifestFilter, fileInfo.dataType );
	}, [ notices, fileInfo, item.period, prepareDownload, siteId ] );

	const restoreFile = useCallback( () => {
		// Reset checklist
		setNodeCheckState( '/', 'unchecked', rewindId );

		// Mark this file as selected
		setNodeCheckState( path, 'checked', rewindId );

		// Request granular restore
		onRequestGranularRestore( siteSlug, rewindId );

		// Tracks restore interest
		const trackingProps = {
			file_type: item.type,
			...( hasCredentials !== undefined && { has_credentials: hasCredentials } ),
		};
		if ( source === 'dashboard' ) {
			onTrackEvent( 'calypso_dashboard_backup_browser_restore_single_file', trackingProps );
		} else {
			onTrackEvent( 'calypso_jetpack_backup_browser_restore_single_file', trackingProps );
		}
	}, [
		setNodeCheckState,
		path,
		onRequestGranularRestore,
		siteSlug,
		rewindId,
		onTrackEvent,
		source,
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
			notices.showError(
				__( 'There was an error retrieving your file information. Please try again.' )
			);
		}
	}, [ notices, isError ] );

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
			size="compact"
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
			size="compact"
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
			size="compact"
		>
			{ isProcessingDownload ? __( 'Preparing' ) : __( 'Download file' ) }
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
			<HStack className="file-card__detail" justify="flex-start" spacing={ 1 }>
				<Text weight={ 700 }>{ label }</Text>
				<Text>{ value }</Text>
			</HStack>
		);
	};

	const hasMeta = item.type === 'table' || size || modifiedTime || fileInfo?.hash;
	return (
		<Card isRounded={ false } isBorderless className="file-card">
			<CardBody className="file-card__body">
				<VStack>
					<HStack wrap style={ { alignItems: 'flex-start' } }>
						{ hasMeta && (
							<VStack spacing={ 1 }>
								{ item.type === 'table' && (
									<FileDetail
										label={
											/* translators: This refers to database table rows. */
											__( 'Rows:' )
										}
										value={ item.rowCount ?? 0 }
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
								{ modifiedTime && (
									<FileDetail
										label={
											/* translators: This refers to the date when the file was modified. */
											__( 'Modified:' )
										}
										value={ modifiedTime }
									/>
								) }
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
						) }
						{ showActions && (
							<ButtonStack style={ { width: 'auto', flexShrink: 0 } } alignment="top">
								{ renderDownloadButton() }
								{ item.type !== 'wordpress' && (
									<Button
										disabled={ ! isRestoreEnabled }
										onClick={ restoreFile }
										variant="primary"
										size="compact"
									>
										{ __( 'Restore' ) }
									</Button>
								) }
							</ButtonStack>
						) }
					</HStack>
					{ fileInfo?.size !== undefined && fileInfo.size > 0 && (
						<FilePreview
							item={ item }
							siteId={ siteId }
							onTrackEvent={ onTrackEvent }
							source={ source }
						/>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

export default FileInfoCard;
