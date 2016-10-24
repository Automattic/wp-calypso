/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';
import flowRight from 'lodash/flowRight';
import noop from 'lodash/noop';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { startMappingAuthors, startUpload } from 'lib/importer/actions';
import { appStates } from 'state/imports/constants';
import Button from 'components/forms/form-button';
import DropZone from 'components/drop-zone';
import ProgressBar from 'components/progress-bar';
import Gridicon from 'components/gridicon';
import { connectDispatcher } from './dispatcher-converter';

export const UploadingPane = React.createClass( {
	displayName: 'SiteSettingsUploadingPane',

	mixins: [ PureRenderMixin ],

	propTypes: {
		description: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
		importerStatus: PropTypes.shape( {
			filename: PropTypes.string,
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number
		} )
	},

	componentWillUnmount: function() {
		window.clearInterval( this.randomizeTimer );
	},

	getDefaultProps: function() {
		return { description: null };
	},

	getMessage: function() {
		const { importerState, percentComplete = 0, filename } = this.props.importerStatus;

		switch ( importerState ) {
			case appStates.READY_FOR_UPLOAD:
			case appStates.UPLOAD_FAILURE:
				return <p>{ this.translate( 'Drag a file here, or click to upload a file' ) }</p>;

			case appStates.UPLOADING:
				let uploadPercent = percentComplete,
					progressClasses = classNames( 'importer__upload-progress', {
						'is-complete': uploadPercent > 95
					} ),
					uploaderPrompt;

				if ( uploadPercent < 99 ) {
					uploaderPrompt = this.translate( 'Uploading %(filename)s\u2026', {
						args: { filename }
					} );
				} else {
					uploaderPrompt = this.translate( 'Processing uploaded file\u2026' );
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
						<p>{ this.translate( 'Success! File uploaded.' ) }</p>
						<Button
							className="importer__start"
							onClick={ () => startMappingAuthors( this.props.importerStatus.importerId ) }
						>
							{ this.translate( 'Start Import' ) }
						</Button>
					</div>
				);
		}
	},

	initiateFromDrop: function( event ) {
		this.startUpload( event[ 0 ] );
	},

	initiateFromForm: function( event ) {
		let fileSelector = this.refs.fileSelector;

		event.preventDefault();
		event.stopPropagation();

		this.startUpload( fileSelector.files[ 0 ] );
	},

	isReadyForImport: function() {
		const { importerState } = this.props.importerStatus;
		const { READY_FOR_UPLOAD, UPLOAD_FAILURE } = appStates;

		return includes( [ READY_FOR_UPLOAD, UPLOAD_FAILURE ], importerState );
	},

	openFileSelector: function() {
		let fileSelector = this.refs.fileSelector;

		fileSelector.click();
	},

	startUpload: function( file ) {
		const { startUpload } = this.props;

		startUpload( this.props.importerStatus, file );
	},

	render: function() {
		return (
			<div>
				<p>{ this.props.description }</p>
				<div className="importer__uploading-pane" onClick={ this.isReadyForImport() ? this.openFileSelector : null }>
					<div className="importer__upload-content">
						<Gridicon className="importer__upload-icon" icon="cloud-upload" />
						{ this.getMessage() }
					</div>
					{ this.isReadyForImport()
						? <input ref="fileSelector" type="file" name="exportFile" onChange={ this.initiateFromForm } />
						: null }
					<DropZone onFilesDrop={ this.isReadyForImport() ? this.initiateFromDrop : noop } />
				</div>
			</div>
		);
	}
} );

const mapDispatchToProps = dispatch => ( {
	startUpload: flowRight( dispatch, startUpload )
} );

export default connectDispatcher( null, mapDispatchToProps )( UploadingPane );
