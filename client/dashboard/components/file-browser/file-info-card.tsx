import { Card, CardBody, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { FileBrowserItem } from './types';
import { useBackupFileQuery } from './hooks';
import { convertBytes } from './utils';

interface FileInfoCardProps {
	siteId: number;
	rewindId: number;
	item: FileBrowserItem;
	parentItem?: FileBrowserItem;
	path: string;
}

const FileInfoCard = ( { siteId, rewindId, item, parentItem, path }: FileInfoCardProps ) => {
	const {
		data: fileInfo,
		isLoading,
		isError,
	} = useBackupFileQuery( siteId, rewindId, path, ! item.hasChildren );

	const handleDownload = () => {
		if ( fileInfo?.downloadUrl ) {
			window.open( fileInfo.downloadUrl, '_blank' );
		}
	};

	const formatDate = ( timestamp?: number ) => {
		if ( ! timestamp ) return __( 'Unknown', 'calypso' );
		return new Date( timestamp * 1000 ).toLocaleString();
	};

	const formatSize = ( bytes?: number ) => {
		if ( typeof bytes !== 'number' ) return __( 'Unknown', 'calypso' );
		const { unitAmount, unit } = convertBytes( bytes );
		return `${ unitAmount } ${ unit }`;
	};

	if ( item.hasChildren ) {
		return (
			<Card>
				<CardBody>
					<h3>{ item.name }</h3>
					<p>{ __( 'Directory', 'calypso' ) }</p>
					{ item.totalItems && (
						<p>{ __( '%d items', 'calypso' ).replace( '%d', item.totalItems.toString() ) }</p>
					) }
				</CardBody>
			</Card>
		);
	}

	if ( isLoading ) {
		return (
			<Card>
				<CardBody>
					<div className="file-info-card__loading">
						<div className="placeholder" />
						<div className="placeholder" />
						<div className="placeholder" />
					</div>
				</CardBody>
			</Card>
		);
	}

	if ( isError ) {
		return (
			<Card>
				<CardBody>
					<h3>{ item.name }</h3>
					<p>{ __( 'Error loading file information', 'calypso' ) }</p>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card>
			<CardBody>
				<div className="file-info-card__header">
					<h3>{ item.name }</h3>
					{ fileInfo?.downloadUrl && (
						<Button variant="secondary" icon={ download } onClick={ handleDownload }>
							{ __( 'Download', 'calypso' ) }
						</Button>
					) }
				</div>
				<div className="file-info-card__details">
					<div className="file-info-card__detail">
						<strong>{ __( 'Type:', 'calypso' ) }</strong>
						<span>{ item.type }</span>
					</div>
					{ fileInfo?.size && (
						<div className="file-info-card__detail">
							<strong>{ __( 'Size:', 'calypso' ) }</strong>
							<span>{ formatSize( fileInfo.size ) }</span>
						</div>
					) }
					{ fileInfo?.mtime && (
						<div className="file-info-card__detail">
							<strong>{ __( 'Modified:', 'calypso' ) }</strong>
							<span>{ formatDate( fileInfo.mtime ) }</span>
						</div>
					) }
					{ fileInfo?.hash && (
						<div className="file-info-card__detail">
							<strong>{ __( 'Hash:', 'calypso' ) }</strong>
							<span className="file-info-card__hash">{ fileInfo.hash }</span>
						</div>
					) }
				</div>
			</CardBody>
		</Card>
	);
};

export default FileInfoCard;
