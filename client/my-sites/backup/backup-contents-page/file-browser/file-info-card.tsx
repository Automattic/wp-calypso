import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import wp from 'calypso/lib/wp';
import { FileBrowserItem } from './types';
import { useBackupPathInfoQuery } from './use-backup-path-info-query';
import { convertBytes } from './util';

interface FileInfoCardProps {
	siteId: number;
	item: FileBrowserItem;
}

const FilePreview: FunctionComponent< FilePreviewProps > = ( { item, fileUrl } ) => {
	const [ fileContent, setFileContent ] = useState( '' );

	useEffect( () => {
		if ( item.type === 'text' || item.type === 'code' ) {
			fetch( fileUrl )
				.then( ( response ) => response.text() )
				.then( ( data ) => setFileContent( data ) );
		}
	}, [ item.type, fileUrl ] );

	let content;

	switch ( item.type ) {
		case 'text':
		case 'code':
			content = <pre>{ fileContent }</pre>;
			break;
		case 'image':
			content = <img src={ fileUrl } alt="file-preview" />;
			break;
		case 'audio':
			content = (
				// We don't have captions for backed up audio files
				// eslint-disable-next-line jsx-a11y/media-has-caption
				<audio controls>
					<source src={ fileUrl } type="audio/mpeg" />
				</audio>
			);
			break;
		case 'video':
			content = (
				// We don't have captions for backed up video files
				// eslint-disable-next-line jsx-a11y/media-has-caption
				<video controls>
					<source src={ fileUrl } type="video/mp4" />
				</video>
			);
			break;
	}

	return <div className="file-card__preview">{ content }</div>;
};

const FileInfoCard: FunctionComponent< FileInfoCardProps > = ( { siteId, item } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

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

	const modifiedTime = fileInfo?.mtime ? moment.unix( fileInfo.mtime ).format( 'lll' ) : null;
	const size = fileInfo?.size ? convertBytes( fileInfo.size ) : null;

	const [ fileUrl, setFileUrl ] = useState( '' );

	const downloadFile = useCallback( () => {
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
			} );
	}, [ siteId, item ] );

	const previewFile = () => {
		const manifestPath = window.btoa( item.manifestPath ?? '' );

		//Get the download URL
		wp.req
			.get( {
				path: `/sites/${ siteId }/rewind/backup/${ item.period }/file/${ manifestPath }/url`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( response: { url: string } ) => {
				const downloadUrl = response.url;
				setFileUrl( downloadUrl );
			} );
	};

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
			<div className="file-card__actions">
				<Button
					variant="secondary"
					className="file-card__action"
					onClick={ downloadFile }
					text="Download"
				/>
				<Button
					variant="secondary"
					className="file-card__action"
					onClick={ previewFile }
					text="Preview file"
				/>
			</div>
			{ fileUrl && <FilePreview item={ item } fileUrl={ fileUrl } /> }
		</div>
	);
};

interface FilePreviewProps {
	item: FileBrowserItem;
	fileUrl: string;
}

export default FileInfoCard;
