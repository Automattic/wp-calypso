/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FilePicker from 'components/file-picker';
import DropZone from 'components/drop-zone';
import { getSelectedSiteId } from 'state/ui/selectors';
import notices from 'notices';
import debugFactory from 'debug';
import { MAX_UPLOAD_ZIP_SIZE } from 'lib/automated-transfer/constants';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:upload-drop-zone' );

class UploadDropZone extends Component {
	static propTypes = {
		doUpload: PropTypes.func.isRequired,
		disabled: PropTypes.bool,
		// Connected
		siteId: PropTypes.number,
	};

	onFileSelect = ( files ) => {
		const { translate, siteId, doUpload } = this.props;

		if ( files.length !== 1 ) {
			notices.error( translate( 'Please drop a single zip file' ) );
			return;
		}

		// DropZone supplies an array, FilePicker supplies a FileList
		const file = files[ 0 ] || files.item( 0 );
		debug( 'zip file:', file );

		if ( file.size > MAX_UPLOAD_ZIP_SIZE ) {
			notices.error( translate( 'Zip file is too large. Please upload a file under 50 MB.' ) );
			return;
		}

		doUpload( siteId, file );
	};

	render() {
		const { translate, disabled } = this.props;
		const dropText = translate( 'Drop files or click here to install' );
		const uploadInstructionsText = translate( 'Only single .zip files are accepted.' );

		const className = classNames( 'upload-drop-zone', {
			'is-disabled': disabled,
		} );

		return (
			<div className={ className }>
				<div className="upload-drop-zone__dropzone">
					<DropZone onFilesDrop={ this.onFileSelect } />
					<FilePicker accept="application/zip" onPick={ this.onFileSelect }>
						<Gridicon className="upload-drop-zone__icon" icon="cloud-upload" size={ 48 } />
						{ dropText }
						<span className="upload-drop-zone__instructions">{ uploadInstructionsText }</span>
					</FilePicker>
				</div>
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( UploadDropZone ) );
