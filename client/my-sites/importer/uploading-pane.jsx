/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { flow, get, head, includes, isEqual, noop } from 'lodash';
import Gridicon from 'gridicons';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { startMappingAuthors, startUpload } from 'lib/importer/actions';
import { appStates } from 'state/imports/constants';
import Button from 'components/forms/form-button';
import DropZone from 'components/drop-zone';
import ProgressBar from 'components/progress-bar';
import { isSupportedFileType, getRecommendedExperience } from 'lib/importer/file-type-detection';
import {
	clearImportFile,
	evaluateImportFile,
	recommendImportUX,
} from 'state/imports/uploads/actions';
import getImportUploadFile from 'state/selectors/get-import-upload-file';
import getImportUploadFileName from 'state/selectors/get-import-upload-filename';

const debug = debugFactory( 'calypso:importer-uploading-pane' );

class UploadingPane extends React.PureComponent {
	static displayName = 'SiteSettingsUploadingPane';

	static propTypes = {
		description: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
		} ),
		filename: PropTypes.string,
		percentComplete: PropTypes.number,
		sourceType: PropTypes.string,
	};

	static defaultProps = { description: null };

	fileSelectorRef = React.createRef();

	componentDidMount() {
		// @TODO should we do this...?
		this.props.clearImportFile();
	}

	componentWillUnmount() {
		window.clearInterval( this.randomizeTimer );
		this.props.clearImportFile();
	}

	componentDidUpdate( prevProps ) {
		const { uploadFile } = this.props;
		if ( uploadFile && ! isEqual( prevProps.uploadFile, uploadFile ) ) {
			const recommendedUX = getRecommendedExperience( uploadFile );
			console.log( { recommendedUX } );
			this.props.recommendImportUX( recommendedUX );
			return;
		}
	}

	getMessage = () => {
		const { importerState } = this.props.importerStatus;
		const { filename, percentComplete = 0 } = this.props;

		switch ( importerState ) {
			case appStates.READY_FOR_UPLOAD:
			case appStates.UPLOAD_FAILURE:
				return <p>{ this.props.translate( 'Drag a file here, or click to upload a file' ) }</p>;

			case appStates.UPLOADING: {
				const uploadPercent = percentComplete;
				const progressClasses = classNames( 'importer__upload-progress', {
					'is-complete': uploadPercent > 95,
				} );
				let uploaderPrompt;

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
			}
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

	initiateFromDrop = files => this.maybeSelectFiles( files );

	initiateFromForm = event => {
		event.preventDefault();
		event.stopPropagation();

		return this.maybeSelectFiles( get( this.fileSelectorRef, 'current.files' ) );
	};

	// @TODO a better name than `maybeSelectFiles`..?
	maybeSelectFiles = ( files = [] ) => {
		if ( ! ( files && files.length ) ) {
			debug( 'no files' );
			this.setState( {
				selectedFile: head( files ),
			} );
		}

		if ( files && files.length > 1 ) {
			/**
			 * @TODO: Recommend media upload experience instead of just assuming the first file in the list...
			 * or, preferably, supporting multiple xml files :)
			 */
			debug( 'Multiple files were provided. Assuming you meant to use the first one.' );
		}

		this.props.evaluateImportFile( head( files ) );
	};

	isReadyForImport() {
		const { importerState } = this.props.importerStatus;
		const { READY_FOR_UPLOAD, UPLOAD_FAILURE } = appStates;

		return includes( [ READY_FOR_UPLOAD, UPLOAD_FAILURE ], importerState );
	}

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
		const { sourceType } = this.props;
		console.log( { sourceType } );

		try {
			const isSupported = isSupportedFileType( sourceType, file.type );

			if ( ! isSupported ) {
				const { group, subType } = parseFileType( file );
				switch ( group ) {
					case 'image':
						console.log( { actionType: 'IMPORT_FILE_TYPE_DETECTED_IMAGE' } );
						return;
					case 'application':
						console.log( {
							actionType: 'IMPORT_FILE_TYPE_DETECTED_APPLICATION',
							subType,
						} );
						return;
					default:
						throw 'Unsupported';
				}
			}

			console.log( { type: file.type, isSupported } );
		} catch ( e ) {
			console.log( 'actionType: IMPORT_FILE_TYPE_DETECTION_ERROR' );
			return;
		}
		//startUpload( this.props.importerStatus, file );
	};

	render() {
		const isReadyForImport = this.isReadyForImport();

		return (
			<div>
				<p>{ this.props.description }</p>
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
	connect(
		state => ( {
			percentComplete: get( state, 'imports.uploads.percentComplete' ),
			uploadFile: getImportUploadFile( state ),
			uploadFileName: getImportUploadFileName( state ),
		} ),
		{
			clearImportFile,
			evaluateImportFile,
			recommendImportUX,
		}
	),
	localize
)( UploadingPane );
