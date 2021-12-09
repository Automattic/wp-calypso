import { PLAN_BUSINESS, FEATURE_UPLOAD_THEMES } from '@automattic/calypso-products';
import { Card, ProgressBar, Button } from '@automattic/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { includes, find, isEmpty, flowRight } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import UploadDropZone from 'calypso/blocks/upload-drop-zone';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FeatureExample from 'calypso/components/feature-example';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import WpAdminAutoLogin from 'calypso/components/wpadmin-auto-login';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import AutoLoadingHomepageModal from 'calypso/my-sites/themes/auto-loading-homepage-modal';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
// Necessary for ThanksModal
import { connectOptions } from 'calypso/my-sites/themes/theme-options';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import {
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteOnAtomicPlan from 'calypso/state/selectors/is-site-on-atomic-plan';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import {
	getSiteAdminUrl,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import siteCanUploadThemesOrPlugins from 'calypso/state/sites/selectors/can-upload-themes-or-plugins';
import { uploadTheme, clearThemeUpload, initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import { getBackPath } from 'calypso/state/themes/themes-ui/selectors';
import {
	isUploadInProgress,
	isUploadComplete,
	hasUploadFailed,
	getUploadedThemeId,
	getUploadError,
	getUploadProgressTotal,
	getUploadProgressLoaded,
	isInstallInProgress,
} from 'calypso/state/themes/upload-theme/selectors';
import {
	getSelectedSiteId,
	getSelectedSite,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

import './style.scss';

const debug = debugFactory( 'calypso:themes:theme-upload' );

class Upload extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		selectedSite: PropTypes.object,
		useUpsellPage: PropTypes.bool,
		inProgress: PropTypes.bool,
		complete: PropTypes.bool,
		failed: PropTypes.bool,
		uploadedTheme: PropTypes.object,
		error: PropTypes.object,
		progressTotal: PropTypes.number,
		progressLoaded: PropTypes.number,
		installing: PropTypes.bool,
		isJetpack: PropTypes.bool,
		backPath: PropTypes.string,
		showEligibility: PropTypes.bool,
	};

	state = {
		showEligibility: this.props.showEligibility,
	};

	componentDidMount() {
		const { siteId, inProgress, noticeType } = this.props;
		! inProgress && this.props.clearThemeUpload( siteId );
		if ( this.props.canUploadThemesOrPlugins ) {
			this.redirectToWpAdmin();
		}

		if ( 'purchase-success' === noticeType ) {
			this.purchaseSuccessMessage();
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			const { siteId, inProgress } = nextProps;
			! inProgress && this.props.clearThemeUpload( siteId );
		}

		if ( nextProps.showEligibility !== this.props.showEligibility ) {
			this.setState( { showEligibility: nextProps.showEligibility } );
		}
	}

	onProceedClick = () => {
		this.setState( { showEligibility: false } );
	};

	componentDidUpdate( prevProps ) {
		if ( this.props.canUploadThemesOrPlugins ) {
			this.redirectToWpAdmin();
		}
		if ( this.props.complete && ! prevProps.complete ) {
			this.successMessage();
		} else if ( this.props.failed && ! prevProps.failed ) {
			this.failureMessage();
		}
	}

	redirectToWpAdmin() {
		page( `https://${ this.props.siteSlug }/wp-admin/theme-install.php` );
	}

	successMessage() {
		const { translate, uploadedTheme, themeId } = this.props;
		this.props.successNotice(
			translate( 'Successfully uploaded theme %(name)s', {
				args: {
					// using themeId lets us show a message before theme data arrives
					name: uploadedTheme ? uploadedTheme.name : themeId,
				},
			} ),
			{ duration: 5000 }
		);
	}

	purchaseSuccessMessage() {
		const { translate } = this.props;
		this.props.successNotice( translate( 'Your purchase has been completed!' ) );
	}

	failureMessage() {
		const { translate, error } = this.props;

		debug( 'Error', { error } );

		const errorCauses = {
			exists: translate( 'Install problem: Theme already installed on site.' ),
			already_installed: translate( 'Install problem: Theme already installed on site.' ),
			'too large': translate( 'Install problem: Theme zip must be under 10MB.' ),
			incompatible: translate( 'Install problem: Incompatible theme.' ),
			unsupported_mime_type: translate( 'Install problem: Not a valid zip file' ),
			initiate_failure: translate(
				'Install problem: Theme may not be valid. Check that your zip file contains only the theme you are trying to install.'
			),
		};

		const errorString = JSON.stringify( error ).toLowerCase();
		const cause = find( errorCauses, ( v, key ) => {
			return includes( errorString, key );
		} );

		const unknownCause = error.error ? `: ${ error.error }` : '';
		this.props.errorNotice( cause || translate( 'Problem installing theme' ) + unknownCause );
	}

	renderProgressBar() {
		const { translate, progressTotal, progressLoaded, installing } = this.props;

		const uploadingMessage = translate( 'Uploading your theme…' );
		const installingMessage = this.props.isJetpack
			? translate( 'Installing your theme…' )
			: translate( 'Configuring your site…' );

		return (
			<div>
				<span className="theme-upload__title">
					{ installing ? installingMessage : uploadingMessage }
				</span>
				<ProgressBar
					value={ progressLoaded || 0 }
					total={ progressTotal || 100 }
					title={ translate( 'Uploading progress' ) }
					isPulsing={ installing }
				/>
			</div>
		);
	}

	onActivateClick = () => {
		const { activate } = this.props.options;
		activate.action( this.props.themeId );
	};

	onTryAndCustomizeClick = () => {
		const { tryandcustomize } = this.props.options;
		tryandcustomize.action( this.props.themeId );
	};

	renderUpgradeBanner() {
		const { siteId, translate } = this.props;
		const redirectTo = encodeURIComponent( `/themes/upload/${ siteId }?notice=purchase-success` );

		return (
			<UpsellNudge
				title={ translate( 'Upgrade to the Business plan to access the theme install features' ) }
				event="calypso_theme_install_upgrade_click"
				href={ `/checkout/${ siteId }/business?redirect_to=${ redirectTo }` }
				plan={ PLAN_BUSINESS }
				feature={ FEATURE_UPLOAD_THEMES }
				showIcon={ true }
			/>
		);
	}

	renderTheme() {
		const { uploadedTheme: theme, translate, options } = this.props;
		const { tryandcustomize, activate } = options;

		return (
			<div className="theme-upload__theme-sheet">
				<img className="theme-upload__screenshot" src={ theme.screenshot } alt="" />
				<h2 className="theme-upload__theme-name">{ theme.name }</h2>
				<div className="theme-upload__author">
					{ translate( 'by ' ) }
					<a href={ theme.author_uri }>{ theme.author }</a>
				</div>
				<div className="theme-upload__description">{ theme.description }</div>
				<div className="theme-upload__action-buttons">
					<Button onClick={ this.onTryAndCustomizeClick }>{ tryandcustomize.label }</Button>
					<Button primary onClick={ this.onActivateClick }>
						{ activate.label }
					</Button>
				</div>
			</div>
		);
	}

	renderUploadCard() {
		const {
			complete,
			failed,
			inProgress,
			isOnAtomicPlan,
			isJetpack,
			isAutomatedTransfer,
			selectedSite,
			uploadedTheme,
		} = this.props;

		const { showEligibility } = this.state;

		const uploadAction = isJetpack ? this.props.uploadTheme : this.props.initiateThemeTransfer;
		const isDisabled = showEligibility || ( ! isOnAtomicPlan && ! isJetpack );

		const WrapperComponent = isDisabled ? FeatureExample : Fragment;

		return (
			<WrapperComponent>
				<Card>
					{ ! inProgress && ! complete && (
						<UploadDropZone doUpload={ uploadAction } disabled={ isDisabled } />
					) }
					{ inProgress && this.renderProgressBar() }
					{ complete && ! failed && uploadedTheme && this.renderTheme() }
					{ complete && isAutomatedTransfer && <WpAdminAutoLogin site={ selectedSite } /> }
				</Card>
			</WrapperComponent>
		);
	}

	renderNotAvailableForMultisite() {
		return (
			<EmptyContent
				title={ this.props.translate( 'Not available for multi site' ) }
				line={ this.props.translate( 'Use the WP Admin interface instead' ) }
				action={ this.props.translate( 'Open WP Admin' ) }
				actionURL={ this.props.siteAdminUrl }
				illustration={ '/calypso/images/illustrations/illustration-jetpack.svg' }
			/>
		);
	}

	render() {
		const {
			backPath,
			complete,
			isFetchingPurchases,
			isJetpack,
			isMultisite,
			isOnAtomicPlan,
			siteId,
			themeId,
			translate,
		} = this.props;

		const showUpgradeBanner = ! isFetchingPurchases && ! isOnAtomicPlan && ! isJetpack;
		const { showEligibility } = this.state;

		if ( isMultisite ) {
			return this.renderNotAvailableForMultisite();
		}

		return (
			<Main className="theme-upload" wideLayout>
				<PageViewTracker path="/themes/upload/:site" title="Themes > Install" />
				<DocumentHead title={ translate( 'Install Theme' ) } />

				<QuerySitePurchases siteId={ siteId } />
				<QueryEligibility siteId={ siteId } />
				<QueryActiveTheme siteId={ siteId } />
				{ themeId && complete && <QueryCanonicalTheme siteId={ siteId } themeId={ themeId } /> }
				<ThanksModal source="upload" />
				<AutoLoadingHomepageModal source="upload" />

				<FormattedHeader
					brandFont
					headerText={ translate( 'Themes' ) }
					subHeaderText={ translate(
						'If you have a theme in .zip format, you may install or update it by uploading it here. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="themes-upload" showIcon={ false } />
								),
							},
						}
					) }
					align="left"
				/>
				<HeaderCake backHref={ backPath }>{ translate( 'Install theme' ) }</HeaderCake>

				{ showUpgradeBanner && this.renderUpgradeBanner() }

				{ showEligibility && (
					<EligibilityWarnings backUrl={ backPath } onProceed={ this.onProceedClick } />
				) }

				{ this.renderUploadCard() }
			</Main>
		);
	}
}

const ConnectedUpload = connectOptions( Upload );

const UploadWithOptions = ( props ) => {
	const { siteId, uploadedTheme } = props;
	return <ConnectedUpload { ...props } siteId={ siteId } theme={ uploadedTheme } />;
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const themeId = getUploadedThemeId( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const { eligibilityHolds, eligibilityWarnings } = getEligibility( state, siteId );
	// Use this selector to take advantage of eligibility card placeholders
	// before data has loaded.
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const hasEligibilityMessages = ! (
		isEmpty( eligibilityHolds ) && isEmpty( eligibilityWarnings )
	);
	const canUploadThemesOrPlugins = siteCanUploadThemesOrPlugins( state, siteId );
	const isAtomic = isSiteWpcomAtomic( state, siteId );
	const isOnAtomicPlan = isSiteOnAtomicPlan( state, siteId );
	const showEligibility =
		( isAtomic || ( isOnAtomicPlan && ! isJetpack ) ) &&
		( hasEligibilityMessages || ! isEligible || ! canUploadThemesOrPlugins );

	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		selectedSite: getSelectedSite( state ),
		isJetpack,
		inProgress: isUploadInProgress( state, siteId ),
		complete: isUploadComplete( state, siteId ),
		failed: hasUploadFailed( state, siteId ),
		themeId,
		isMultisite: isJetpackSiteMultiSite( state, siteId ),
		uploadedTheme: getCanonicalTheme( state, siteId, themeId ),
		error: getUploadError( state, siteId ),
		progressTotal: getUploadProgressTotal( state, siteId ),
		progressLoaded: getUploadProgressLoaded( state, siteId ),
		installing: isInstallInProgress( state, siteId ),
		backPath: getBackPath( state ),
		showEligibility,
		isAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		canUploadThemesOrPlugins,
		isOnAtomicPlan,
		isFetchingPurchases:
			isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
	};
};

const flowRightArgs = [
	connect( mapStateToProps, {
		errorNotice,
		successNotice,
		uploadTheme,
		clearThemeUpload,
		initiateThemeTransfer,
	} ),
	localize,
];

export default flowRight( ...flowRightArgs )( UploadWithOptions );
