/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import FilePicker from 'components/file-picker';
import DropZone from 'components/drop-zone';
import { localize } from 'i18n-calypso';
import notices from 'notices';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:themes:theme-upload' );

class Upload extends React.Component {

	constructor( props ) {
		super( props );
	}

	onFileSelect = ( files ) => {
		const { translate } = this.props;
		const errorMessage = translate( 'Please drop a single zip file' );

		if ( files.length !== 1 ) {
			notices.error( errorMessage );
			return;
		}
		const file = files[ 0 ] || files.item( 0 );
		if ( file.type !== 'application/zip' ) {
			notices.error( errorMessage );
			return;
		}
		debug( 'zip file:', file );
	}

	render() {
		const { translate } = this.props;
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
			<Main>
				<HeaderCake onClick={ page.back }>{ translate( 'Upload theme' ) }</HeaderCake>
				<Card>
					<span className="theme-upload__prompt">{ uploadPromptText }</span>
					<span className="theme-upload__instructions">{ uploadInstructionsText }</span>
					<div className="theme-upload__dropzone">
						<DropZone onFilesDrop={ this.onFileSelect } />
						<FilePicker accept="application/zip" onPick={ this.onFileSelect } >
							<Gridicon
								className="theme-upload__dropzone-icon"
								icon="cloud-upload"
								size={ 48 } />
							{ dropText }
						</FilePicker>
					</div>
				</Card>
			</Main>
		);
	}
}

export default localize( Upload );

