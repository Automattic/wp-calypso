/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { flow, get, includes, noop, truncate } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { startMappingAuthors, startUpload } from 'lib/importer/actions';
import { appStates } from 'state/imports/constants';
import DropZone from 'components/drop-zone';
import ProgressBar from 'components/progress-bar';
import ImporterActionButton from 'my-sites/importer/importer-action-buttons/action-button';
import ImporterActionButtonContainer from 'my-sites/importer/importer-action-buttons/container';
import ImporterCloseButton from 'my-sites/importer/importer-action-buttons/close-button';

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
	};

	static defaultProps = { description: null };

	fileSelectorRef = React.createRef();

	componentWillUnmount() {
		window.clearInterval( this.randomizeTimer );
	}

	getMessage = () => {
		const { importerState } = this.props.importerStatus;
		const { filename, percentComplete = 0 } = this.props;

		switch ( importerState ) {
			case appStates.READY_FOR_UPLOAD:
			case appStates.UPLOAD_FAILURE:
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

	initiateFromDrop = event => {
		this.startUpload( event[ 0 ] );
	};

	initiateFromForm = event => {
		event.preventDefault();
		event.stopPropagation();

		this.startUpload( this.fileSelectorRef.current.files[ 0 ] );
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
		startUpload( this.props.importerStatus, file );
	};

	render() {
		const { importerStatus, site, isEnabled } = this.props;
		const { importerState, importerId } = importerStatus;
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
				<ImporterActionButtonContainer>
					<ImporterCloseButton
						importerStatus={ importerStatus }
						site={ site }
						isEnabled={ isEnabled }
					/>
					<ImporterActionButton
						primary
						disabled={ importerState !== appStates.UPLOAD_SUCCESS }
						onClick={ () => startMappingAuthors( importerId ) }
					>
						{ this.props.translate( 'Continue' ) }
					</ImporterActionButton>
				</ImporterActionButtonContainer>
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
