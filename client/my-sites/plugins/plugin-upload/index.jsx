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
import { initiateAutomatedTransferWithPluginZip } from 'calypso/state/automated-transfer/actions';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
	getAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { uploadPlugin, clearPluginUpload } from 'calypso/state/plugins/upload/actions';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import isPluginUploadInProgress from 'calypso/state/selectors/is-plugin-upload-in-progress';
import {
	getSiteAdminUrl,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

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
		this.setState( { showEligibility: false } );
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

	render() {
		const { translate, isJetpackMultisite, siteId, siteSlug } = this.props;
		const { showEligibility } = this.state;

		return (
			<Main>
				<PageViewTracker path="/plugins/upload/:site" title="Plugins > Upload" />
				<QueryEligibility siteId={ siteId } />
				<NavigationHeader navigationItems={ [] } title={ translate( 'Plugins' ) } />
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
		productToBeInstalled,
	} ),
	localize,
];

export default flowRight( ...flowRightArgs )( PluginUpload );
