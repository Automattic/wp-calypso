import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import wp from 'calypso/lib/wp';
import { FileBrowserItem } from './types';
import { useBackupPathInfoQuery } from './use-backup-path-info-query';
import { convertBytes } from './util';

interface FileInfoCardProps {
	siteId: number;
	item: FileBrowserItem;
}

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

	const [ fileContent, setFileContent ] = useState( '' );

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
				const downloadUrl = response.url.replace( 'https://public-api.wordpress.com/wpcom/v2', '' );

				// Get the file content
				wp.req
					.get( {
						path: downloadUrl,
						apiNamespace: 'wpcom/v2',
					} )
					.then( ( response: any ) => {
						setFileContent( response );
					} );
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
			<div className="file-card__preview">{ fileContent }</div>
		</div>
	);
};

export default FileInfoCard;
