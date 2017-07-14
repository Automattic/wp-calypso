/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import ProgressBar from 'components/progress-bar';
import DropZone from 'components/drop-zone';
import FilePicker from 'components/file-picker';
import { uploadPlugin, clearPluginUpload } from 'state/plugins/upload/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getPluginUploadError,
	getPluginUploadProgress,
	getUploadedPluginId,
	isPluginUploadComplete,
	isPluginUploadInProgress,
} from 'state/selectors';
import notices from 'notices';
import {
	MAX_UPLOADED_THEME_SIZE
} from 'lib/automated-transfer/constants';

class PluginUpload extends React.Component {
	back = () => {
		page.back();
	}

	renderUploadCard() {
		const { inProgress, complete } = this.props;
		return (
			<Card>
				{ ! inProgress && ! complete && this.renderDropZone() }
				{ inProgress && this.renderProgressBar() }
			</Card>
		);
	}

	onFileSelect = ( files ) => {
		const { translate, siteId } = this.props;
		const errorMessage = translate( 'Please drop a single zip file' );

		if ( files.length !== 1 ) {
			notices.error( errorMessage );
			return;
		}

		// DropZone supplies an array, FilePicker supplies a FileList
		const file = files[ 0 ] || files.item( 0 );

		// TODO: plugin-specific constant
		if ( file.size > MAX_UPLOADED_THEME_SIZE ) {
			notices.error(
				translate( 'Plugin zip is too large. Please upload a plugin under 50 MB.' )
			);

			return;
		}

		this.props.uploadPlugin( siteId, file );
	}

	renderDropZone() {
		const { translate } = this.props;
		const dropText = translate(
			'Drop files or click here to upload'
		);
		const uploadInstructionsText = translate(
			'Only single .zip files are accepted.'
		);

		return (
			<div className="plugin-upload__dropzone">
				<DropZone onFilesDrop={ this.onFileSelect } />
				<FilePicker accept="application/zip" onPick={ this.onFileSelect } >
					<Gridicon
						className="plugin-upload__dropzone-icon"
						icon="cloud-upload"
						size={ 48 } />
					{ dropText }
					<span className="plugin-upload__dropzone-instructions">{ uploadInstructionsText }</span>
				</FilePicker>
			</div>
		);
	}

	renderProgressBar() {
		const { translate, progress, installing } = this.props;

		const uploadingMessage = translate( 'Uploading your plugin' );
		const installingMessage = translate( 'Installing your plugin' );

		return (
			<div>
				<span className="plugin-upload__title">
					{ installing ? installingMessage : uploadingMessage }
				</span>
				<ProgressBar
					value={ progress }
					title={ translate( 'Uploading progress' ) }
					isPulsing={ installing }
				/>
			</div>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<Main>
				<HeaderCake onClick={ this.back }>{ translate( 'Upload plugin' ) }</HeaderCake>
				{ this.renderUploadCard() }
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const error = getPluginUploadError( state, siteId );
		const progress = getPluginUploadProgress( state, siteId );
		return {
			siteId,
			inProgress: isPluginUploadInProgress( state, siteId ),
			complete: isPluginUploadComplete( state, siteId ),
			failed: !! error,
			pluginId: getUploadedPluginId( state, siteId ),
			error,
			progress,
			installing: progress === 100,
		};
	},
	{ uploadPlugin, clearPluginUpload }
)( localize( PluginUpload ) );

