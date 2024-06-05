import { ProgressBar } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { truncate } from 'lodash';
import { connect } from 'react-redux';
import DropZone from 'calypso/components/drop-zone';
import { UploadingPane as UploadingPaneBase } from 'calypso/my-sites/importer/uploading-pane';
import { upload } from 'calypso/signup/icons';
import {
	startMappingAuthors,
	startUpload,
	startImporting,
	failPreUpload,
} from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getUploadFilename,
	getUploadPercentComplete,
} from 'calypso/state/imports/uploads/selectors';
import './uploading-pane.scss';

export class UploadingPane extends UploadingPaneBase {
	getUploadMessage = () => {
		const { importerState } = this.props.importerStatus;
		const { filename, percentComplete = 0 } = this.props;

		// Override base component only where we are uploading something
		if ( importerState === appStates.UPLOAD_PROCESSING || importerState === appStates.UPLOADING ) {
			const uploadPercent = percentComplete;
			const progressClasses = clsx( {
				'is-complete': uploadPercent > 95,
			} );
			const uploaderPrompt =
				importerState === appStates.UPLOADING && uploadPercent < 99
					? this.props.translate( 'Uploading %(filename)s\u2026', {
							args: { filename: truncate( filename, { length: 40 } ) },
					  } )
					: this.props.translate( 'Processing uploaded file\u2026' );

			// Override ProgressBar color and force 'compact'
			return (
				<div>
					<p>{ uploaderPrompt }</p>
					<ProgressBar
						compact
						className={ progressClasses }
						value={ uploadPercent }
						total={ 100 }
						isPulsing={ false }
					/>
				</div>
			);
		}

		// Return base message
		return this.getMessage();
	};

	render() {
		const isReadyForImport = this.isReadyForImport();
		const importerStatusClasses = clsx(
			'uploading-pane__upload-content',
			this.props.importerStatus.importerState
		);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const noop = () => {};

		return (
			<div>
				<div
					className="uploading-pane"
					role="button"
					tabIndex={ 0 }
					onClick={ isReadyForImport ? this.openFileSelector : undefined }
					onKeyPress={ isReadyForImport ? this.handleKeyPress : undefined }
				>
					<div className={ importerStatusClasses }>
						{ upload } { this.getUploadMessage() }
					</div>
					{ isReadyForImport && (
						<input
							ref={ this.fileSelectorRef }
							type="file"
							name="exportFile"
							onChange={ this.initiateFromForm }
						/>
					) }
					<DropZone
						onFilesDrop={ isReadyForImport ? this.initiateFromDrop : noop }
						icon={ upload }
					/>
				</div>
				<p className="uploading-pane__description">{ this.props.description }</p>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		filename: getUploadFilename( state ),
		percentComplete: getUploadPercentComplete( state ),
	} ),
	{ startMappingAuthors, startUpload, failPreUpload, startImporting }
)( localize( UploadingPane ) );
