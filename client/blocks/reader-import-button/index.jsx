/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import FilePicker from 'components/file-picker';

class ReaderImportButton extends React.Component {

	static propTypes = {
		onError: React.PropTypes.func,
		onImport: React.PropTypes.func,
		onProgress: React.PropTypes.func,
	}

	static defaultProps = {
		onError: noop,
		onImport: noop,
		onProgress: noop,
	}

	state = { disabled: false };

	onClick = ( event ) => {
		// Don't kick off a new export request if there's one in progress
		if ( this.state.disabled ) {
			event.preventDefault();
		}
	}

	onPick = ( files ) => {
		// we only care about the first file in the list
		const file = files[ 0 ];
		if ( ! file ) {
			return;
		}

		this.fileName = file.name;
		const req = wpcom.undocumented().importReaderFeed( file, this.onImport );
		req.upload.onprogress = this.onImportProgress;

		this.setState( {
			disabled: true
		} );
	}

	onImport = ( err, data ) => {
		this.setState( {
			disabled: false
		} );

		if ( err ) {
			this.props.onError( err );
		} else {
			// tack on the file name since it will be displayed in the UI
			data.fileName = this.fileName;
			this.props.onImport( data );
		}
	}

	onImportProgress = ( event ) => {
		this.props.onProgress( event );
	}

	render() {
		return (
			<div className="reader-import-button">
				<FilePicker accept=".xml,.opml" onClick={ this.onClick } onPick={ this.onPick }>
					<Gridicon icon="cloud-upload" className="reader-import-button__icon" />
					<span className="reader-import-button__label">
						{ this.props.translate( 'Import' ) }
					</span>
				</FilePicker>
			</div>
		);
	}
}

export default localize( ReaderImportButton );
