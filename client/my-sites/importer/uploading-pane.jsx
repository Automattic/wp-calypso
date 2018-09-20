/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';
import { flowRight, includes, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { startMappingAuthors, startUpload } from 'lib/importer/actions';
import { appStates } from 'state/imports/constants';
import Button from 'components/forms/form-button';
import DropZone from 'components/drop-zone';
import ProgressBar from 'components/progress-bar';
import { connectDispatcher } from './dispatcher-converter';

class UploadingPane extends React.PureComponent {
	static displayName = 'SiteSettingsUploadingPane';

	static propTypes = {
		description: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
		importerStatus: PropTypes.shape( {
			filename: PropTypes.string,
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number,
		} ),
	};

	static defaultProps = { description: null };

	componentWillUnmount() {
		window.clearInterval( this.randomizeTimer );
	}

	getMessage = () => {
		const { importerState, percentComplete = 0, filename } = this.props.importerStatus;

		switch ( importerState ) {
			case appStates.READY_FOR_UPLOAD:
			case appStates.UPLOAD_FAILURE:
				return <p>{ this.props.translate( 'Drag a file here, or click to upload a file' ) }</p>;

			case appStates.UPLOADING:
				let uploadPercent = percentComplete,
					progressClasses = classNames( 'importer__upload-progress', {
						'is-complete': uploadPercent > 95,
					} ),
					uploaderPrompt;

				if ( uploadPercent < 99 ) {
					uploaderPrompt = this.props.translate( 'Uploading %(filename)s\u2026', {
						args: { filename },
					} );
				} else {
					uploaderPrompt = this.props.translate( 'Processing uploaded file\u2026' );
				}

				return (
					<div>
						<p>{ uploaderPrompt }</p>
						<ProgressBar className={ progressClasses } value={ uploadPercent } total={ 100 } />
					</div>
				);

			case appStates.UPLOAD_SUCCESS:
				return (
					<div>
						<p>{ this.props.translate( 'Success! File uploaded.' ) }</p>
						<Button
							className="importer__start"
							onClick={ () => startMappingAuthors( this.props.importerStatus.importerId ) }
						>
							{ this.props.translate( 'Continue' ) }
						</Button>
					</div>
				);
		}
	};

	initiateFromDrop = event => {
		this.startUpload( event[ 0 ] );
	};

	initiateFromForm = event => {
		const fileSelector = this.refs.fileSelector;

		event.preventDefault();
		event.stopPropagation();

		this.startUpload( fileSelector.files[ 0 ] );
	};

	isReadyForImport = () => {
		const { importerState } = this.props.importerStatus;
		const { READY_FOR_UPLOAD, UPLOAD_FAILURE } = appStates;

		return includes( [ READY_FOR_UPLOAD, UPLOAD_FAILURE ], importerState );
	};

	openFileSelector = () => {
		const fileSelector = this.refs.fileSelector;

		fileSelector.click();
	};

	startUpload = file => {
		const { startUpload } = this.props;

		if ( window.chrome && window.chrome.webstore ) {
			/**
			 * This is a workaround for a Chrome issue that prevents file uploads from `calypso.localhost` through
			 * the proxy iframe we use.
			 *
			 * It shouldn't add any side effects to the way the uploads work in Chrome and the workaround should be
			 * removed once the issues listed below get fixed.
			 *
			 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=866805
			 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=631877
			 */
			const newFile = new File( [ file.slice( 0, file.size ) ], file.name, { type: file.type } );
			startUpload( this.props.importerStatus, newFile );
		} else {
			startUpload( this.props.importerStatus, file );
		}
	};

	render() {
		return (
			<div>
				<p>{ this.props.description }</p>
				<div
					className="importer__uploading-pane"
					onClick={ this.isReadyForImport() ? this.openFileSelector : null }
				>
					<div className="importer__upload-content">
						<Gridicon className="importer__upload-icon" icon="cloud-upload" />
						{ this.getMessage() }
					</div>
					{ this.isReadyForImport() ? (
						<input
							ref="fileSelector"
							type="file"
							name="exportFile"
							onChange={ this.initiateFromForm }
						/>
					) : null }
					<DropZone onFilesDrop={ this.isReadyForImport() ? this.initiateFromDrop : noop } />
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	startUpload: flowRight(
		dispatch,
		startUpload
	),
} );

export default connectDispatcher( null, mapDispatchToProps )( localize( UploadingPane ) );
