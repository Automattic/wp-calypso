import { useEffect, useState } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { FileBrowserItem } from './types';
import { useBackupFileQuery } from './use-backup-file-query';

interface FilePreviewProps {
	item: FileBrowserItem;
	siteId: number;
}

/**
 * This component is responsible for rendering the preview of a file.
 */
const FilePreview: FunctionComponent< FilePreviewProps > = ( { item, siteId } ) => {
	const translate = useTranslate();
	const [ fileContent, setFileContent ] = useState( '' );
	const [ showSensitivePreview, setShowSensitivePreview ] = useState( false );

	// Let's restrict previews to these types for now
	const validTypes = [ 'text', 'code', 'audio', 'image', 'video' ];
	const isValidType = validTypes.includes( item.type );

	// Determine if the file is sensitive
	const isSensitive = item.manifestPath === 'f5:/wp-config.php';

	const isTextContent = item.type === 'text' || item.type === 'code';
	const shouldPreviewFile =
		isValidType && ( ! isSensitive || ( isSensitive && showSensitivePreview ) );

	const { isSuccess, isError, isInitialLoading, data } = useBackupFileQuery(
		siteId,
		item.period,
		item.manifestPath,
		shouldPreviewFile
	);

	const dispatch = useDispatch();

	const handleShowPreviewClick = useCallback( () => {
		setShowSensitivePreview( true );
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_browser_preview_file_sensitive_click' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( isSuccess && data && data.url && isTextContent ) {
			window
				.fetch( data.url )
				.then( ( response ) => response.text() )
				.then( ( fileData ) => setFileContent( fileData ) );
		}
	}, [ item.type, isSuccess, data, isTextContent ] );

	if ( isSensitive && ! showSensitivePreview ) {
		return (
			<div className="file-card__preview-sensitive">
				<p>{ translate( 'This preview is hidden because it contains sensitive information.' ) }</p>
				<button className="button button-small" onClick={ handleShowPreviewClick }>
					{ translate( 'Show preview' ) }
				</button>
			</div>
		);
	}

	if ( ! shouldPreviewFile ) {
		return null;
	}

	const renderFileContent = () => {
		let content;

		switch ( item.type ) {
			case 'text':
			case 'code':
				content = <pre>{ fileContent }</pre>;
				break;
			case 'image':
				content = <img src={ data.url } alt="file-preview" />;
				break;
			case 'audio':
				content = (
					// We don't have captions for backed up audio files
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<audio controls>
						<source src={ data.url } type="audio/mpeg" />
					</audio>
				);
				break;
			case 'video':
				content = (
					// We don't have captions for backed up video files
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<video controls>
						<source src={ data.url } type="video/mp4" />
					</video>
				);
				break;
		}

		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_browser_preview_file', {
				file_type: item.type,
			} )
		);
		return content;
	};

	const isLoading = isTextContent ? ! fileContent && ! isError : isInitialLoading;
	const isReady = isTextContent ? fileContent : isSuccess;
	const classNames = clsx( 'file-card__preview', item.type, {
		'file-card__preview--is-loading': isLoading,
	} );

	return (
		<>
			<div className={ classNames }>
				{ isLoading && <div className="file-browser-node__loading placeholder" /> }
				{ isReady ? renderFileContent() : null }
			</div>
		</>
	);
};

export default FilePreview;
