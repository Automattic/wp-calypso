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
import { localize } from 'i18n-calypso';

const onPick = function() {
};

function upload( { translate } ) {
	const uploadPromptText = translate(
		'Do you have a custom theme to upload to your site?'
	);
	const uploadInstructionsText = translate(
		"Make sure it's a single zip file, and upload it here."
	);

	return (
		<div>
			<HeaderCake onClick={ page.back }>
				{ translate( 'Upload theme' ) }
			</HeaderCake>
			<Card>
				<span className="theme-upload__prompt">{ uploadPromptText }</span>
				<span className="theme-upload__instructions">{ uploadInstructionsText }</span>
				<div className="theme-upload__dropzone">
					<FilePicker accept="application/zip"
								onPick={ onPick } >
						<Gridicon className="theme-upload__dropzone-icon" icon="cloud-upload" size={ 48 } />
						<span className="theme-upload__dropzone-text">
							{ translate( 'Drop files or click here to upload' ) }
						</span>
					</FilePicker>
				</div>
			</Card>
		</div>
	);
}

export default localize( upload );

