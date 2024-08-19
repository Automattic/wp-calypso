import { ProgressBar, FormInputValidation, FormLabel, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import { WPImportError, FileTooLarge } from 'calypso/blocks/importer/wordpress/types';
import DropZone from 'calypso/components/drop-zone';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import TextInput from 'calypso/components/forms/form-text-input';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import {
	startMappingAuthors,
	startUpload,
	failPreUpload,
	startImporting,
} from 'calypso/state/imports/actions';
import { appStates, MAX_FILE_SIZE } from 'calypso/state/imports/constants';
import {
	getUploadFilename,
	getUploadPercentComplete,
} from 'calypso/state/imports/uploads/selectors';

import './uploading-pane.scss';

const noop = () => {};

export class UploadingPane extends PureComponent {
	static displayName = 'SiteSettingsUploadingPane';

	static propTypes = {
		description: PropTypes.node,
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
		fromSite: PropTypes.string,
		nextStepUrl: PropTypes.string,
		skipNextStep: PropTypes.func,
	};

	static defaultProps = { description: null, optionalUrl: null };

	fileSelectorRef = createRef();

	constructor( props ) {
		super( props );
		this.state = { urlInput: null, fileToBeUploaded: null };
	}

	componentDidUpdate( prevProps ) {
		const { importerStatus } = this.props;
		const { importerStatus: prevImporterStatus } = prevProps;

		if (
			( prevImporterStatus.importerState === appStates.UPLOADING ||
				prevImporterStatus.importerState === appStates.UPLOAD_PROCESSING ||
				prevImporterStatus.importerState === appStates.UPLOAD_SUCCESS ) &&
			importerStatus.importerState === appStates.UPLOAD_SUCCESS
		) {
			switch ( importerStatus.importerFileType ) {
				case 'content':
					this.props.startMappingAuthors( importerStatus.importerId );
					break;
				case 'playground':
				case 'jetpack_backup':
					// The startImporting action is dispatched from the onboarding flow
					break;
			}
		}
	}

	getMessage = () => {
		const { importerState, importerFileType } = this.props.importerStatus;
		const { filename, percentComplete = 0 } = this.props;

		switch ( importerState ) {
			case appStates.READY_FOR_UPLOAD:
			case appStates.UPLOAD_FAILURE:
				if ( this.state.fileToBeUploaded ) {
					return <p>{ this.state?.fileToBeUploaded?.name?.substring?.( 0, 100 ) }</p>;
				}
				return (
					<p>
						{ this.props.translate(
							'Drag a file here, or {{span}}click to upload a file{{/span}}',
							{
								components: { span: <span /> },
							}
						) }
					</p>
				);
			case appStates.UPLOAD_PROCESSING:
			case appStates.UPLOADING: {
				const uploadPercent = percentComplete;
				const progressClasses = clsx( 'importer__upload-progress', {
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
						<ProgressBar
							className={ progressClasses }
							value={ uploadPercent }
							total={ 100 }
							isPulsing={ uploadPercent > 99 || importerState === appStates.UPLOAD_PROCESSING }
						/>
					</div>
				);
			}
			case appStates.UPLOAD_SUCCESS:
				if ( importerFileType === 'playground' ) {
					return (
						<div className="importer-upload-warning">
							<p>
								{ this.props.translate(
									'Playground imports are not yet available through this form.{{br/}}' +
										'Please head over to {{a}}this page{{/a}} to resume the import process.',
									{
										components: {
											br: <br />,
											a: (
												<a
													href={ `/setup/import-focused/importerWordpress?siteSlug=${ this.props.site.slug }&option=content` }
												/>
											),
										},
									}
								) }{ ' ' }
							</p>
						</div>
					);
				}
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
		let url = this.state.urlInput;
		if ( this.props.optionalUrl && this.props.fromSite ) {
			url = this.props.fromSite;
		}
		this.startUpload( this.state.fileToBeUploaded, url );
	};

	setupUpload = ( file ) => {
		this.setState( { fileToBeUploaded: file } );
		const { importerStatus } = this.props;
		const fileExtension = file?.name?.split( '.' ).pop()?.toLowerCase?.() ?? '';

		// fail fast if a user tries to upload a .wpress file to improve the user experience
		if ( fileExtension === 'wpress' ) {
			this.props.failPreUpload(
				importerStatus.importerId,
				'',
				WPImportError.WPRESS_FILE_IS_NOT_SUPPORTED,
				file
			);
			return;
		}

		// Fail fast if a user tries to upload a too big file
		if ( file.size > MAX_FILE_SIZE ) {
			this.props.failPreUpload( importerStatus.importerId, '', FileTooLarge.FILE_TOO_LARGE, file );
			return;
		}

		this.startUpload( file );
	};

	isReadyForImport() {
		const { importerState } = this.props.importerStatus;
		const { READY_FOR_UPLOAD, UPLOAD_FAILURE } = appStates;

		return [ READY_FOR_UPLOAD, UPLOAD_FAILURE ].includes( importerState );
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
		const validationFn = this.props?.optionalUrl?.validate;

		return ! urlInput || urlInput === '' || ( validationFn ? validationFn( urlInput ) : true );
	};

	setUrl = ( event ) => {
		const urlInput = event.target.value;
		this.setState( { urlInput } );
	};

	render() {
		const { importerStatus, fromSite, nextStepUrl, skipNextStep } = this.props;
		const isReadyForImport = this.isReadyForImport();
		const importerStatusClasses = clsx(
			'importer__upload-content',
			this.props.importerStatus.importerState
		);
		const hasEnteredUrl = this.state.urlInput && this.state.urlInput !== '';
		const isValidUrl = this.validateUrl( this.state.urlInput );
		const urlDescription = isValidUrl
			? this.props?.optionalUrl?.description
			: this.props?.optionalUrl?.invalidDescription;
		const skipButtonDisabled = importerStatus.importerState === appStates.UPLOAD_PROCESSING;

		return (
			<div>
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
				{ this.props.optionalUrl && ! fromSite && (
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
				<ImporterActionButtonContainer noSpacing>
					<ImporterActionButton
						href={ nextStepUrl }
						onClick={ skipNextStep }
						disabled={ skipButtonDisabled }
					>
						Skip for now
					</ImporterActionButton>
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
	{ startMappingAuthors, startUpload, startImporting, failPreUpload }
)( localize( UploadingPane ) );
