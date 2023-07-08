import { useEffect, useState } from '@wordpress/element';
import { FunctionComponent } from 'react';
import { FileBrowserItem } from './types';
import { useBackupFileQuery } from './use-backup-file-query';

interface FilePreviewProps {
	item: FileBrowserItem;
	siteId: number;
}

const FilePreview: FunctionComponent< FilePreviewProps > = ( { item, siteId } ) => {
	const [ fileContent, setFileContent ] = useState( '' );

	// Let's restrict previews to these types for now
	const validTypes = [ 'text', 'code', 'audio', 'image', 'video' ];

	const isValidType = validTypes.includes( item.type );

	const { isSuccess, isInitialLoading, data } = useBackupFileQuery(
		siteId,
		item.period,
		item.manifestPath,
		isValidType
	);

	useEffect( () => {
		if ( isSuccess && data && data.url && ( item.type === 'text' || item.type === 'code' ) ) {
			window
				.fetch( data.url )
				.then( ( response ) => response.text() )
				.then( ( fileData ) => setFileContent( fileData ) );
		}
	}, [ item.type, isSuccess, data ] );

	if ( ! isValidType ) {
		return null;
	}

	if ( isInitialLoading ) {
		return <div className="file-browser-node__loading placeholder" />;
	}

	if ( ! isSuccess ) {
		return null;
	}

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

	return (
		<>
			<div className={ `file-card__preview ${ item.type }` }>{ content }</div>
		</>
	);
};

export default FilePreview;
