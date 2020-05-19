/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';
import { isEmpty, flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import { Card, ProgressBar } from '@automattic/components';
import UploadDropZone from 'blocks/upload-drop-zone';
import EligibilityWarnings from 'blocks/eligibility-warnings';
import EmptyContent from 'components/empty-content';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryEligibility from 'components/data/query-atat-eligibility';
import { uploadPlugin, clearPluginUpload } from 'state/plugins/upload/actions';
import { initiateAutomatedTransferWithPluginZip } from 'state/automated-transfer/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import getPluginUploadError from 'state/selectors/get-plugin-upload-error';
import getPluginUploadProgress from 'state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'state/selectors/get-uploaded-plugin-id';
import isPluginUploadComplete from 'state/selectors/is-plugin-upload-complete';
import isPluginUploadInProgress from 'state/selectors/is-plugin-upload-in-progress';
import { getSiteAdminUrl, isJetpackSite, isJetpackSiteMultiSite } from 'state/sites/selectors';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
	getAutomatedTransferStatus,
} from 'state/automated-transfer/selectors';
import { successNotice } from 'state/notices/actions';
import { transferStates } from 'state/automated-transfer/constants';

class PluginUpload extends React.Component {
	state = {
		showEligibility: this.props.showEligibility,
	};

	componentDidMount() {
		const { siteId, inProgress } = this.props;
		! inProgress && this.props.clearPluginUpload( siteId );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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

		const { COMPLETE } = transferStates;

		if (
			this.props.automatedTransferStatus !== COMPLETE &&
			nextProps.automatedTransferStatus === COMPLETE
		) {
			nextProps.successNotice(
				nextProps.translate( "You've successfully uploaded the %(pluginId)s plugin.", {
					args: { pluginId: nextProps.pluginId },
				} ),
				{ duration: 8000 }
			);
		}
	}

	back = () => {
		page.back();
	};

	onProceedClick = () => {
		this.setState( { showEligibility: false } );
	};

	renderUploadCard() {
		const { inProgress, complete, isJetpack } = this.props;

		const uploadAction = isJetpack
			? this.props.uploadPlugin
			: this.props.initiateAutomatedTransferWithPluginZip;

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
		const { translate, isJetpackMultisite, siteId, siteSlug } = this.props;
		const { showEligibility } = this.state;

		return (
			<Main>
				<PageViewTracker path="/plugins/upload/:site" title="Plugins > Upload" />
				<QueryEligibility siteId={ siteId } />
				<HeaderCake onClick={ this.back }>{ translate( 'Install plugin' ) }</HeaderCake>
				{ isJetpackMultisite && this.renderNotAvailableForMultisite() }
				{ showEligibility && (
					<EligibilityWarnings
						backUrl={ `/plugins/${ siteSlug }` }
						onProceed={ this.onProceedClick }
					/>
				) }
				{ ! isJetpackMultisite && ! showEligibility && this.renderUploadCard() }
			</Main>
		);
	}
}

const mapStateToProps = ( state ) => {
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
		isEmpty( eligibilityHolds ) && isEmpty( eligibilityWarnings )
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
		isJetpackMultisite,
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		showEligibility: ! isJetpack && ( hasEligibilityMessages || ! isEligible ),
		automatedTransferStatus: getAutomatedTransferStatus( state, siteId ),
	};
};

const flowRightArgs = [
	connect( mapStateToProps, {
		uploadPlugin,
		clearPluginUpload,
		initiateAutomatedTransferWithPluginZip,
		successNotice,
	} ),
	localize,
];

export default flowRight( ...flowRightArgs )( PluginUpload );
