/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import FilePicker from 'components/file-picker';
import DropZone from 'components/drop-zone';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:themes:theme-upload' );

const onFileSelect = function( files ) {
	// files can be FileList object or array
	debug( 'Chosen files:', files );
	if ( files.length !== 1 ) {
		debug( 'multiple files not allowed' );
		return;
	}
	const file = files[ 0 ] || files.item( 0 );
	if ( file.type !== 'application/zip' ) {
		debug( 'file must be a zip' );
		return;
	}
	debug( 'zip file:', file );
};

function upload( { translate } ) {
	const uploadPromptText = translate(
		'Do you have a custom theme to upload to your site?'
	);
	const uploadInstructionsText = translate(
		"Make sure it's a single zip file, and upload it here."
	);
	const dropText = translate(
		'Drop files or click here to upload'
	);

	return (
		<div>
			<HeaderCake onClick={ page.back }>{ translate( 'Upload theme' ) }</HeaderCake>
			<Card>
				<span className="theme-upload__prompt">{ uploadPromptText }</span>
				<span className="theme-upload__instructions">{ uploadInstructionsText }</span>
				<div className="theme-upload__dropzone">
					<DropZone onFilesDrop={ onFileSelect } />
					<FilePicker accept="application/zip" onPick={ onFileSelect } >
						<Gridicon
							className="theme-upload__dropzone-icon"
							icon="cloud-upload"
							size={ 48 } />
						{ dropText }
					</FilePicker>
				</div>
			</Card>
		</div>
	);
}

export default localize( upload );

