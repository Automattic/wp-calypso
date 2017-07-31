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
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { uploadPlugin, clearPluginUpload } from 'state/plugins/upload/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import {
	getPluginUploadError,
	getPluginUploadProgress,
	getUploadedPluginId,
	isPluginUploadComplete,
	isPluginUploadInProgress,
} from 'state/selectors';
import { isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';

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
		const { inProgress, complete, isJetpack } = this.props;
		return (
			<Card>
				{ ! inProgress && ! complete && <UploadDropZone
					doUpload={ this.props.uploadPlugin }
					disabled={ ! isJetpack } /> }
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
		const {
			translate,
			upgradeJetpack,
			siteId,
		} = this.props;

		return (
			<Main>
				<HeaderCake onClick={ this.back }>{ translate( 'Upload plugin' ) }</HeaderCake>
				{ upgradeJetpack && <JetpackManageErrorPage
					template="updateJetpack"
					siteId={ siteId }
					featureExample={ this.renderUploadCard() }
					version="5.1" /> }
				{ ! upgradeJetpack && this.renderUploadCard() }
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const error = getPluginUploadError( state, siteId );
		const progress = getPluginUploadProgress( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			isJetpack,
			inProgress: isPluginUploadInProgress( state, siteId ),
			complete: isPluginUploadComplete( state, siteId ),
			failed: !! error,
			pluginId: getUploadedPluginId( state, siteId ),
			error,
			progress,
			installing: progress === 100,
			upgradeJetpack: isJetpack && ! isJetpackMinimumVersion( state, siteId, 5.1 ),
		};
	},
	{ uploadPlugin, clearPluginUpload }
)( localize( PluginUpload ) );

