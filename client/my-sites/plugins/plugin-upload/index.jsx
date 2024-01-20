import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { isEmpty, flowRight } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import UploadDropZone from 'calypso/blocks/upload-drop-zone';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import HostingActivateStatus from 'calypso/my-sites/hosting/hosting-activate-status';
import { TrialAcknowledgeModal } from 'calypso/my-sites/plans/trials/trial-acknowledge/acknowlege-modal';
import {
	fetchAutomatedTransferStatus,
	initiateAutomatedTransferWithPluginZip,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { uploadPlugin, clearPluginUpload } from 'calypso/state/plugins/upload/actions';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import isPluginUploadInProgress from 'calypso/state/selectors/is-plugin-upload-in-progress';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { requestSite } from 'calypso/state/sites/actions';
import {
	getSiteAdminUrl,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

class PluginUpload extends Component {
	state = {
		showEligibility: this.props.showEligibility,
		showTrialAcknowledgeModal: false,
		isTrialRequested: false,
	};

	componentDidMount() {
		const { siteId, inProgress } = this.props;
		! inProgress && this.props.clearPluginUpload( siteId );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			const { siteId, inProgress } = nextProps;
			! inProgress && this.props.clearPluginUpload( siteId );
		}

		if ( nextProps.showEligibility !== this.props.showEligibility ) {
			this.setState( { showEligibility: nextProps.showEligibility } );
		}

		if ( nextProps.inProgress ) {
			this.props.productToBeInstalled( nextProps.pluginId, nextProps.siteSlug );

			page( `/marketplace/plugin/install/${ nextProps.siteSlug }` );
		}
	}

	back = () => {
		page.back();
	};

	onProceedClick = () => {
		const isFreeTrialEligible = this.props.isEligibleForHostingTrial;
		this.setState( {
			showEligibility: isFreeTrialEligible,
			showTrialAcknowledgeModal: isFreeTrialEligible,
		} );
	};

	renderUploadCard() {
		const { inProgress, complete, isJetpack } = this.props;

		const uploadAction = isJetpack
			? this.props.uploadPlugin
			: this.props.initiateAutomatedTransferWithPluginZip;

		return (
			<Card>{ ! inProgress && ! complete && <UploadDropZone doUpload={ uploadAction } /> }</Card>
		);
	}

	renderNotAvailableForMultisite() {
		const { translate, siteAdminUrl } = this.props;

		return (
			<EmptyContent
				title={ translate( 'Visit WP Admin to install your plugin.' ) }
				action={ translate( 'Go to WP Admin' ) }
				actionURL={ `${ siteAdminUrl }/plugin-install.php` }
				illustration="/calypso/images/illustrations/illustration-jetpack.svg"
			/>
		);
	}

	setOpenModal = ( isOpen ) => {
		this.setState( { showTrialAcknowledgeModal: isOpen } );
	};

	trialRequested = () => {
		this.props.successNotice( this.props.translate( 'Your free trial has been requested.' ), {
			duration: 5000,
		} );
		this.props.requestSiteEligibility( this.props.siteId );
	};

	requestUpdatedEligibility = ( isTransferring, wasTransferring, isTransferCompleted ) => {
		if ( isTransferring || ( wasTransferring && isTransferCompleted ) ) {
			this.props.requestSiteById( this.props.siteId );
			this.props.requestSiteEligibility( this.props.siteId );
		}
	};

	render() {
		const { translate, isJetpackMultisite, siteId, siteSlug, isEligibleForHostingTrial } =
			this.props;
		const { showEligibility, showTrialAcknowledgeModal } = this.state;

		return (
			<Main>
				<PageViewTracker path="/plugins/upload/:site" title="Plugins > Upload" />
				<QueryEligibility siteId={ siteId } />
				<NavigationHeader navigationItems={ [] } title={ translate( 'Plugins' ) } />
				<HeaderCake onClick={ this.back }>{ translate( 'Install plugin' ) }</HeaderCake>
				<HostingActivateStatus context="plugin" onTick={ this.requestUpdatedEligibility } />
				{ isJetpackMultisite && this.renderNotAvailableForMultisite() }
				{ showEligibility && (
					<EligibilityWarnings
						backUrl={ `/plugins/${ siteSlug }` }
						onProceed={ this.onProceedClick }
						showFreeTrial={ isEligibleForHostingTrial }
					/>
				) }
				{ ! isJetpackMultisite && ! showEligibility && this.renderUploadCard() }
				{ isEligibleForHostingTrial && showTrialAcknowledgeModal && (
					<TrialAcknowledgeModal
						setOpenModal={ this.setOpenModal }
						trialRequested={ this.trialRequested }
					/>
				) }
			</Main>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const error = getPluginUploadError( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const isJetpackMultisite = isJetpackSiteMultiSite( state, siteId );
	const { eligibilityHolds, eligibilityWarnings } = getEligibility( state, siteId );
	// Use this selector to take advantage of eligibility card placeholders
	// before data has loaded.
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const isEligibleForHostingTrial = isUserEligibleForFreeHostingTrial( state );
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
		isJetpackMultisite,
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		showEligibility: ! isJetpack && ( hasEligibilityMessages || ! isEligible ),

		isEligibleForHostingTrial,
		site: {
			slug: getSelectedSiteSlug( state ),
		},
	};
};

const flowRightArgs = [
	connect( mapStateToProps, {
		uploadPlugin,
		clearPluginUpload,
		initiateAutomatedTransferWithPluginZip,
		successNotice,
		productToBeInstalled,
		fetchAutomatedTransferStatus,
		requestSiteById: requestSite,
		requestSiteEligibility: requestEligibility,
	} ),
	localize,
];

export default flowRight( ...flowRightArgs )( PluginUpload );
