/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { flow, get, head, includes, isEmpty, isEqual, noop } from 'lodash';
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
import { getRecommendedExperience } from 'lib/importer/file-type-detection';
import {
	clearImportFile,
	confirmCurrentImportFile,
	evaluateImportFile,
	recommendImportUX,
} from 'state/imports/uploads/actions';
import getImportUploadFile from 'state/selectors/get-import-upload-file';
import getImportUploadFileName from 'state/selectors/get-import-upload-filename';
import getImportUploadFileRecommendedUX from 'state/selectors/get-import-upload-recommended-ux';
import isImportUploadFileOkToUpload from 'state/selectors/is-import-upload-file-ok-to-upload';

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
		const { okToUpload, recommendedUX, uploadFile } = this.props;
		if ( uploadFile && ! isEqual( prevProps.uploadFile, uploadFile ) ) {
			this.props.recommendImportUX( getRecommendedExperience( uploadFile ) );
			return;
		}

		if (
			recommendedUX &&
			! isEqual( prevProps.recommendedUX, recommendedUX ) &&
			get( recommendedUX, 'ui' ) === 'calypso-importer'
		) {
			// @TODO make sure selected engine matches recommended
			this.props.confirmCurrentImportFile();
			return;
		}

		if ( okToUpload && ! prevProps.okToUpload ) {
			this.startUpload();
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

	onFileTypeBackClick = () => {
		this.props.clearImportFile();
	};

	onFileTypeContinueClick = () => {
		this.props.confirmCurrentImportFile();
	};

	startUpload = () => {
		const { importerStatus, uploadFile } = this.props;
		console.log( { importerStatus, uploadFile } );
		return;
		if ( isEmpty( importerStatus ) || isEmpty( uploadFile ) ) {
			// @TODO redux error action
			throw 'Cannot upload file';
		}
		startUpload( importerStatus, uploadFile );
	};

	renderVerifyFile = () => {
		const { recommendedUX } = this.props;
		const { ui } = recommendedUX;

		return (
			<div>
				File type may not be supported.
				<div>Recommended Experience: { ui }</div> } Continue anyway..?
				<br />
				<button onClick={ this.onFileTypeBackClick }>Back</button>
				<button onClick={ this.onFileTypeContinueClick }>Continue</button>
			</div>
		);
	};

	render() {
		const { recommendedUX } = this.props;
		const recommendedUI = get( recommendedUX, 'ui' );
		if ( recommendedUI && recommendedUI !== 'calypso-importer' ) {
			return this.renderVerifyFile();
		}

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
			filename: getImportUploadFileName( state ),
			okToUpload: isImportUploadFileOkToUpload( state ),
			percentComplete: get( state, 'imports.uploads.percentComplete' ),
			recommendedUX: getImportUploadFileRecommendedUX( state ),
			uploadFile: getImportUploadFile( state ),
		} ),
		{
			clearImportFile,
			confirmCurrentImportFile,
			evaluateImportFile,
			recommendImportUX,
		}
	),
	localize
)( UploadingPane );
