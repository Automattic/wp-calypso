/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { includes, truncate } from 'lodash';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { startMappingAuthors, startUpload } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getUploadFilename,
	getUploadPercentComplete,
} from 'calypso/state/imports/uploads/selectors';
import DropZone from 'calypso/components/drop-zone';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterCloseButton from 'calypso/my-sites/importer/importer-action-buttons/close-button';
import TextInput from 'calypso/components/forms/form-text-input';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import { ProgressBar } from '@automattic/components';

/**
 * Style dependencies
 */
import './uploading-pane.scss';

const noop = () => {};

class UploadingPane extends React.PureComponent {
	static displayName = 'SiteSettingsUploadingPane';

	static propTypes = {
		description: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
		} ),
		filename: PropTypes.string,
		percentComplete: PropTypes.number,
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			single_user_site: PropTypes.bool.isRequired,
		} ).isRequired,
		optionalUrl: PropTypes.shape( {
			title: PropTypes.string,
			description: PropTypes.string,
			invalidDescription: PropTypes.string,
			validate: PropTypes.func,
		} ),
	};

	static defaultProps = { description: null, optionalUrl: null };

	fileSelectorRef = React.createRef();

	constructor( props ) {
		super( props );
		this.state = { urlInput: null, fileToBeUploaded: null };
	}

	componentDidUpdate( prevProps ) {
		const { importerStatus } = this.props;
		const { importerStatus: prevImporterStatus } = prevProps;

		if (
			( prevImporterStatus.importerState === appStates.UPLOADING ||
				prevImporterStatus.importerState === appStates.UPLOAD_PROCESSING ) &&
			importerStatus.importerState === appStates.UPLOAD_SUCCESS
		) {
			this.props.startMappingAuthors( importerStatus.importerId );
		}
	}

	getMessage = () => {
		const { importerState } = this.props.importerStatus;
		const { filename, percentComplete = 0 } = this.props;

		switch ( importerState ) {
			case appStates.READY_FOR_UPLOAD:
			case appStates.UPLOAD_FAILURE:
				if ( this.state.fileToBeUploaded ) {
					return <p>{ this.state?.fileToBeUploaded?.name?.substring?.( 0, 100 ) }</p>;
				}
				return <p>{ this.props.translate( 'Drag a file here, or click to upload a file' ) }</p>;
			case appStates.UPLOAD_PROCESSING:
			case appStates.UPLOADING: {
				const uploadPercent = percentComplete;
				const progressClasses = classNames( 'importer__upload-progress', {
					'is-complete': uploadPercent > 95,
				} );
				const uploaderPrompt =
					importerState === appStates.UPLOADING && uploadPercent < 99
						? this.props.translate( 'Uploading %(filename)s\u2026', {
								args: { filename: truncate( filename, { length: 40 } ) },
						  } )
						: this.props.translate( 'Processing uploaded file\u2026' );

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
					</div>
				);
		}
	};

	initiateFromDrop = ( event ) => {
		this.setupUpload( event[ 0 ] );
	};

	initiateFromForm = ( event ) => {
		event.preventDefault();
		event.stopPropagation();

		this.setupUpload( this.fileSelectorRef.current.files[ 0 ] );
	};

	initiateFromUploadButton = () => {
		this.startUpload( this.state.fileToBeUploaded, this.state.urlInput );
	};

	setupUpload = ( file ) => {
		this.setState( { fileToBeUploaded: file } );

		// uploads are initiated by a button if a URL field is present.
		if ( this.props.optionalUrl ) {
			return;
		}

		this.startUpload( file );
	};

	isReadyForImport() {
		const { importerState } = this.props.importerStatus;
		const { READY_FOR_UPLOAD, UPLOAD_FAILURE } = appStates;

		return includes( [ READY_FOR_UPLOAD, UPLOAD_FAILURE ], importerState );
	}

	openFileSelector = () => {
		this.fileSelectorRef.current.click();
	};

	handleKeyPress = ( event ) => {
		// Open file selector on Enter or Space
		if ( event.key === 'Enter' || event.key === ' ' ) {
			this.openFileSelector();
		}
	};

	startUpload = ( file, url = undefined ) => {
		this.props.startUpload( this.props.importerStatus, file, url ? url.trim() : undefined );
	};

	validateUrl = ( urlInput ) => {
		return ! urlInput || urlInput === '' || this.props.optionalUrl.validate( urlInput );
	};

	setUrl = ( event ) => {
		const urlInput = event.target.value;
		this.setState( { urlInput } );
	};

	render() {
		const { importerStatus, site, isEnabled } = this.props;
		const isReadyForImport = this.isReadyForImport();
		const importerStatusClasses = classNames(
			'importer__upload-content',
			this.props.importerStatus.importerState
		);
		const hasEnteredUrl = this.state.urlInput && this.state.urlInput !== '';
		const isValidUrl = this.validateUrl( this.state.urlInput );
		const urlDescription = isValidUrl
			? this.props?.optionalUrl?.description
			: this.props?.optionalUrl?.invalidDescription;

		return (
			<div>
				<p className="importer__uploading-pane-description">{ this.props.description }</p>
				<div
					className="importer__uploading-pane"
					role="button"
					tabIndex={ 0 }
					onClick={ isReadyForImport ? this.openFileSelector : null }
					onKeyPress={ isReadyForImport ? this.handleKeyPress : null }
				>
					<div className={ importerStatusClasses }>
						<Gridicon
							size="48"
							className="importer__upload-icon"
							icon={
								this.props.optionalUrl && this.state.fileToBeUploaded ? 'checkmark' : 'cloud-upload'
							}
						/>
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
				{ this.props.optionalUrl && (
					<div className="importer__uploading-pane-url-input">
						<FormLabel>
							{ this.props.optionalUrl.title }
							<TextInput
								label={ this.props.optionalUrl.title }
								onChange={ this.setUrl }
								value={ this.state.urlInput }
								placeholder="https://newsletter.substack.com/"
							/>
						</FormLabel>
						{ hasEnteredUrl ? (
							<FormInputValidation isError={ ! isValidUrl }>{ urlDescription }</FormInputValidation>
						) : (
							<FormSettingExplanation>{ urlDescription }</FormSettingExplanation>
						) }
					</div>
				) }
				<ImporterActionButtonContainer>
					{ this.props.optionalUrl && (
						<ImporterActionButton
							primary
							onClick={ this.initiateFromUploadButton }
							disabled={
								! this.state.fileToBeUploaded || ! this.validateUrl( this.state.urlInput )
							}
						>
							{ this.props.translate( 'Upload' ) }
						</ImporterActionButton>
					) }
					<ImporterCloseButton
						importerStatus={ importerStatus }
						site={ site }
						isEnabled={ isEnabled }
					/>
				</ImporterActionButtonContainer>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		filename: getUploadFilename( state ),
		percentComplete: getUploadPercentComplete( state ),
	} ),
	{ startMappingAuthors, startUpload }
)( localize( UploadingPane ) );
