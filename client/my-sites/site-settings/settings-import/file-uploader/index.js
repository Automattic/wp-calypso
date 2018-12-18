/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { flow, get, includes, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { startMappingAuthors, startUpload } from 'lib/importer/actions';
import { appStates } from 'state/imports/constants';
import Button from 'components/forms/form-button';
import DropZone from 'components/drop-zone';
import ProgressBar from 'components/progress-bar';

class UploadingPane extends React.PureComponent {
	static displayName = 'SiteSettingsUploadingPane';

	static propTypes = {
		description: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
		} ),
		filename: PropTypes.string,
		percentComplete: PropTypes.number,
	};

	static defaultProps = { description: null };

	fileSelectorRef = React.createRef();

	componentWillUnmount() {
		window.clearInterval( this.randomizeTimer );
	}

	getMessage = () => {
		return 'message from getMessage';
	};

	initiateFromDrop = event => {
		this.startUpload( event[ 0 ] );
	};

	initiateFromForm = event => {
		event.preventDefault();
		event.stopPropagation();

		this.startUpload( this.fileSelectorRef.current.files[ 0 ] );
	};

	openFileSelector = () => {
		this.fileSelectorRef.current.click();
	};

	handleKeyPress = event => {
		// Open file selector on Enter or Space
		if ( event.key === 'Enter' || event.key === ' ' ) {
			this.openFileSelector();
		}
	};

	startUpload = file => {
		startUpload( this.props.importerStatus, file );
	};

	render() {
		const isReadyForImport = true;

		return (
			<div>
				<p>{ 'Click to upload' }</p>
				<div
					className="importer__uploading-pane"
					role="button"
					tabIndex={ 0 }
					onClick={ isReadyForImport ? this.openFileSelector : null }
					onKeyPress={ isReadyForImport ? this.handleKeyPress : null }
				>
					<div className="importer__upload-content">
						<Gridicon className="importer__upload-icon" icon="cloud-upload" />
						{ this.getMessage() }
					</div>
					{ isReadyForImport && (
						<input
							ref={ this.fileSelectorRef }
							type="file"
							name="exportFile"
							onChange={ this.initiateFromForm }
						/>
					) }
					<DropZone onFilesDrop={ isReadyForImport ? this.initiateFromDrop : noop } />
				</div>
			</div>
		);
	}
}

export default flow(
	connect( state => ( {
		filename: get( state, 'imports.uploads.filename' ),
		percentComplete: get( state, 'imports.uploads.percentComplete' ),
	} ) ),
	localize
)( UploadingPane );
