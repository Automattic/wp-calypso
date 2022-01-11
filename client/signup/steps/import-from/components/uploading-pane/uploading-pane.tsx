import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import DropZone from 'calypso/components/drop-zone';
import { UploadingPane as UploadingPaneBase } from 'calypso/my-sites/importer/uploading-pane';
import { startMappingAuthors, startUpload } from 'calypso/state/imports/actions';
import {
	getUploadFilename,
	getUploadPercentComplete,
} from 'calypso/state/imports/uploads/selectors';
import './uploading-pane.scss';

export class UploadingPane extends UploadingPaneBase {
	render() {
		const isReadyForImport = this.isReadyForImport();
		const importerStatusClasses = classNames(
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
						<Gridicon size={ 48 } className="uploading-pane__upload-icon" icon={ 'cloud-upload' } />
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
	{ startMappingAuthors, startUpload }
)( localize( UploadingPane ) );
