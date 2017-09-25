/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import page from 'page';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EligibilityWarnings from 'blocks/eligibility-warnings';
import UploadDropZone from 'blocks/upload-drop-zone';
import Card from 'components/card';
import QueryEligibility from 'components/data/query-atat-eligibility';
import EmptyContent from 'components/empty-content';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import ProgressBar from 'components/progress-bar';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { initiateAutomatedTransferWithPluginZip } from 'state/automated-transfer/actions';
import { getEligibility, isEligibleForAutomatedTransfer } from 'state/automated-transfer/selectors';
import { uploadPlugin, clearPluginUpload } from 'state/plugins/upload/actions';
import { getPluginUploadError, getPluginUploadProgress, getUploadedPluginId, isPluginUploadComplete, isPluginUploadInProgress } from 'state/selectors';
import { getSiteAdminUrl, isJetpackMinimumVersion, isJetpackSite, isJetpackSiteMultiSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class PluginUpload extends React.Component {
	state = {
		showEligibility: this.props.showEligibility,
	}

	componentDidMount() {
		const { siteId, inProgress } = this.props;
		! inProgress && this.props.clearPluginUpload( siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			const { siteId, inProgress } = nextProps;
			! inProgress && this.props.clearPluginUpload( siteId );
		}

		if ( nextProps.showEligibility !== this.props.showEligibility ) {
			this.setState( { showEligibility: nextProps.showEligibility } );
		}

		if ( nextProps.complete ) {
			page( `/plugins/${ nextProps.pluginId }/${ nextProps.siteSlug }` );
		}
	}

	back = () => {
		page.back();
	}

	onProceedClick = () => {
		this.setState( { showEligibility: false } );
	}

	renderUploadCard() {
		const { inProgress, complete, isJetpack } = this.props;

		const uploadAction = isJetpack ? this.props.uploadPlugin : this.props.initiateAutomatedTransferWithPluginZip;

		return (
			<Card>
				{ ! inProgress && ! complete && <UploadDropZone doUpload={ uploadAction } /> }
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

	renderNotAvailableForMultisite() {
		const { translate, siteAdminUrl } = this.props;

		return (
			<EmptyContent
				title={ translate( 'Visit WP Admin to install your plugin.' ) }
				action={ translate( 'Go to WP Admin' ) }
				actionURL={ `${ siteAdminUrl }/plugin-install.php` }
				illustration={ '/calypso/images/illustrations/illustration-jetpack.svg' }
			/>
		);
	}

	render() {
		const {
			translate,
			isJetpackMultisite,
			upgradeJetpack,
			siteId,
			siteSlug,
		} = this.props;
		const { showEligibility } = this.state;

		return (
			<Main>
				<QueryEligibility siteId={ siteId } />
				<HeaderCake onClick={ this.back }>{ translate( 'Upload plugin' ) }</HeaderCake>
				{ upgradeJetpack && <JetpackManageErrorPage
					template="updateJetpack"
					siteId={ siteId }
					featureExample={ this.renderUploadCard() }
					version="5.1" /> }
				{ isJetpackMultisite && this.renderNotAvailableForMultisite() }
				{ showEligibility && <EligibilityWarnings
					backUrl={ `/plugins/${ siteSlug }` }
					onProceed={ this.onProceedClick } /> }
				{ ! upgradeJetpack && ! isJetpackMultisite && ! showEligibility && this.renderUploadCard() }
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
		const isJetpackMultisite = isJetpackSiteMultiSite( state, siteId );
		const { eligibilityHolds, eligibilityWarnings } = getEligibility( state, siteId );
		// Use this selector to take advantage of eligibility card placeholders
		// before data has loaded.
		const isEligible = isEligibleForAutomatedTransfer( state, siteId );
		const hasEligibilityMessages = ! (
			isEmpty( eligibilityHolds ) &&
			isEmpty( eligibilityWarnings )
		);

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
			upgradeJetpack: isJetpack && ! isJetpackMultisite && ! isJetpackMinimumVersion( state, siteId, '5.1' ),
			isJetpackMultisite,
			siteAdminUrl: getSiteAdminUrl( state, siteId ),
			showEligibility: ! isJetpack && ( hasEligibilityMessages || ! isEligible ),
		};
	},
	{ uploadPlugin, clearPluginUpload, initiateAutomatedTransferWithPluginZip }
)( localize( PluginUpload ) );

