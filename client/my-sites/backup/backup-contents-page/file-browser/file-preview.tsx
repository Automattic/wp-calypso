import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { unseen } from '@wordpress/icons';
import { useCallback } from 'react';
import { FileBrowserItem } from './types';
import { useBackupFileQuery } from './use-backup-file-query';

interface FilePreviewProps {
	item: FileBrowserItem;
	siteId: number;
	onTrackEvent?: ( eventName: string, properties?: Record< string, unknown > ) => void;
	source: 'calypso' | 'dashboard';
}

/**
 * This component is responsible for rendering the preview of a file.
 */
function FilePreview( { item, siteId, onTrackEvent, source }: FilePreviewProps ) {
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

	const {
		isSuccess,
		isError,
		isLoading: isQueryLoading,
		data,
	} = useBackupFileQuery( siteId, item.period, item.manifestPath, shouldPreviewFile );

	const handleShowPreviewClick = useCallback( () => {
		setShowSensitivePreview( true );
		if ( onTrackEvent ) {
			if ( source === 'dashboard' ) {
				onTrackEvent( 'calypso_dashboard_backup_browser_preview_file_sensitive_click' );
			} else {
				onTrackEvent( 'calypso_jetpack_backup_browser_preview_file_sensitive_click' );
			}
		}
	}, [ onTrackEvent, source ] );

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
			<VStack className="file-card__preview-sensitive" alignment="center">
				<Icon icon={ unseen } />
				<Text as="p">
					{ __( 'This preview is hidden because it contains sensitive information.' ) }
				</Text>
				<Button size="compact" variant="secondary" onClick={ handleShowPreviewClick }>
					{ __( 'Show preview' ) }
				</Button>
			</VStack>
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
				content = (
					<Text as="pre" style={ { backgroundColor: 'var(--color-surface)' } }>
						{ fileContent }
					</Text>
				);
				break;
			case 'image':
				content = <img src={ data?.url } alt="file-preview" />;
				break;
			case 'audio':
				content = (
					// We don't have captions for backed up audio files
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<audio controls style={ { width: '100%' } }>
						<source src={ data?.url } type="audio/mpeg" />
					</audio>
				);
				break;
			case 'video':
				content = (
					// We don't have captions for backed up video files
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<video controls style={ { width: '100%' } }>
						<source src={ data?.url } type="video/mp4" />
					</video>
				);
				break;
		}

		if ( onTrackEvent ) {
			const trackingProps = { file_type: item.type };
			if ( source === 'dashboard' ) {
				onTrackEvent( 'calypso_dashboard_backup_browser_preview_file', trackingProps );
			} else {
				onTrackEvent( 'calypso_jetpack_backup_browser_preview_file', trackingProps );
			}
		}
		return content;
	};

	const isLoading = isTextContent ? ! fileContent && ! isError : isQueryLoading;
	const isReady = isTextContent ? fileContent : isSuccess;

	return (
		<div className="file-card__preview">
			{ isLoading && <div className="file-browser-node__loading placeholder" /> }
			{ isReady ? renderFileContent() : null }
		</div>
	);
}

export default FilePreview;
