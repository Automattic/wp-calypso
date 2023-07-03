import { Button, Spinner } from '@automattic/components';
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

	const [ isDownloading, setIsDownloading ] = useState< boolean >( false );
	const downloadFile = useCallback( () => {
		setIsDownloading( true );
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
				setIsDownloading( false );
			} );
	}, [ siteId, item ] );

	const showActions = item.type !== 'table' && item.extensionType !== 'changed';

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

			{ showActions && (
				<div className="file-card__actions">
					<Button className="file-card__action" onClick={ downloadFile } disabled={ isDownloading }>
						{ isDownloading ? <Spinner /> : translate( 'Download file' ) }
					</Button>
				</div>
			) }
		</div>
	);
};

export default FileInfoCard;
