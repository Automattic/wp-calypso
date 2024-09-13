import { FEATURE_SFTP } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { isEmpty, flowRight } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import UploadDropZone from 'calypso/blocks/upload-drop-zone';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import EmptyContent from 'calypso/components/empty-content';
import FeatureExample from 'calypso/components/feature-example';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import HostingActivateStatus from 'calypso/my-sites/hosting/hosting-activate-status';
import { isHostingTrialSite } from 'calypso/sites-dashboard/utils';
import {
	fetchAutomatedTransferStatus,
	initiateAutomatedTransferWithPluginZip,
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
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	getSiteAdminUrl,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

class PluginUpload extends Component {
	state = {
		showEligibility: this.props.showEligibility,
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
		this.setState( {
			showEligibility: false,
			isTransferring: false,
		} );
	};

	renderUploadCard() {
		const { inProgress, complete, isJetpack, hasSftpFeature } = this.props;

		const uploadAction = isJetpack
			? this.props.uploadPlugin
			: this.props.initiateAutomatedTransferWithPluginZip;

		const WrapperComponent = ! hasSftpFeature ? FeatureExample : Fragment;
		return (
			<WrapperComponent>
				<Card>
					{ ! inProgress && ! complete && (
						<UploadDropZone doUpload={ uploadAction } disabled={ ! hasSftpFeature } />
					) }
				</Card>
			</WrapperComponent>
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

	requestUpdatedSiteData = ( isTransferring, wasTransferring, isTransferCompleted ) => {
		if ( isTransferring ) {
			this.setState( { isTransferring: true } );
		}
		if ( wasTransferring && isTransferCompleted ) {
			this.setState( { isTransferring: false } );
		}
	};

	render() {
		const { translate, isJetpackMultisite, siteId, siteSlug, isJetpack, isTrialSite, isAtomic } =
			this.props;
		const { showEligibility, isTransferring } = this.state;

		const showEligibilityWarnings = showEligibility && ! isTransferring && ! isTrialSite;

		return (
			<Main>
				<PageViewTracker path="/plugins/upload/:site" title="Plugins > Upload" />
				<QueryEligibility siteId={ siteId } />
				<NavigationHeader navigationItems={ [] } title={ translate( 'Plugins' ) } />
				<HeaderCake onClick={ this.back }>{ translate( 'Install plugin' ) }</HeaderCake>
				{ ! isJetpack && (
					<HostingActivateStatus context="plugin" onTick={ this.requestUpdatedSiteData } />
				) }
				{ isJetpackMultisite && this.renderNotAvailableForMultisite() }
				{ showEligibilityWarnings && (
					<EligibilityWarnings
						backUrl={ `/plugins/${ siteSlug }` }
						onProceed={ this.onProceedClick }
					/>
				) }
				{ ( ( ! isJetpackMultisite && ! showEligibility ) || isAtomic || isTrialSite ) &&
					this.renderUploadCard() }
			</Main>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	const error = getPluginUploadError( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const isAtomic = isSiteWpcomAtomic( state, siteId );
	const isJetpackMultisite = isJetpackSiteMultiSite( state, siteId );
	const hasSftpFeature = siteHasFeature( state, siteId, FEATURE_SFTP );
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
		isAtomic,
		hasSftpFeature,
		inProgress: isPluginUploadInProgress( state, siteId ),
		complete: isPluginUploadComplete( state, siteId ),
		failed: !! error,
		pluginId: getUploadedPluginId( state, siteId ),
		error,
		isJetpackMultisite,
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		showEligibility: ! isJetpack && ( hasEligibilityMessages || ! isEligible ),
		isTrialSite: isHostingTrialSite( site ),
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
	} ),
	localize,
];

export default flowRight( ...flowRightArgs )( PluginUpload );
