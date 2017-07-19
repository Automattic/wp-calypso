/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import ProgressBar from 'components/progress-bar';
import UploadDropZone from 'blocks/upload-drop-zone';
import { uploadPlugin, clearPluginUpload } from 'state/plugins/upload/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	getPluginUploadError,
	getPluginUploadProgress,
	getUploadedPluginId,
	isPluginUploadComplete,
	isPluginUploadInProgress,
} from 'state/selectors';

class PluginUpload extends React.Component {

	componentDidMount() {
		const { siteId, inProgress } = this.props;
		! inProgress && this.props.clearPluginUpload( siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			const { siteId, inProgress } = nextProps;
			! inProgress && this.props.clearPluginUpload( siteId );
		}

		if ( nextProps.complete ) {
			page( `/plugins/${ nextProps.pluginId }/${ nextProps.siteSlug }` );
		}
	}

	back = () => {
		page.back();
	}

	renderUploadCard() {
		const { inProgress, complete } = this.props;
		return (
			<Card>
				{ ! inProgress && ! complete && <UploadDropZone doUpload={ this.props.uploadPlugin } /> }
				{ inProgress && this.renderProgressBar() }
			</Card>
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
			siteSlug: getSelectedSiteSlug( state ),
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

