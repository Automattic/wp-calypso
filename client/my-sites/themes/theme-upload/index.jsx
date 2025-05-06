import {
	PLAN_BUSINESS,
	FEATURE_UPLOAD_THEMES,
	FEATURE_UPLOAD_PLUGINS,
	PLAN_ECOMMERCE,
	getPlan,
} from '@automattic/calypso-products';
import { Card, ProgressBar, Button } from '@automattic/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { includes, find, isEmpty, flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FeatureExample from 'calypso/components/feature-example';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import WpAdminAutoLogin from 'calypso/components/wpadmin-auto-login';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
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
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import {
	getSiteAdminUrl,
	getSiteThemeInstallUrl,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import { uploadTheme, clearThemeUpload, initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
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
	isTransferInProgress,
	isTransferComplete,
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
		const { siteId, inProgress } = this.props;
		! inProgress && this.props.clearThemeUpload( siteId );
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
		if ( this.props.complete && ! prevProps.complete ) {
			this.successMessage();
		} else if ( this.props.failed && ! prevProps.failed ) {
			this.failureMessage();
		}
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
		const { siteSlug, isCommerceTrial, translate } = this.props;
		const redirectTo = encodeURIComponent( `/themes/upload/${ siteSlug }` );

		let upsellPlan = PLAN_BUSINESS;
		let title =
			/* translators: %(planName)s the short-hand version of the Business plan name */
			translate( 'Upgrade to the %(planName)s plan to access the theme install features', {
				args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
			} );
		let upgradeUrl = `/checkout/${ siteSlug }/business?redirect_to=${ redirectTo }`;

		if ( isCommerceTrial ) {
			upsellPlan = PLAN_ECOMMERCE;
			title = translate( 'Upgrade your plan to access the theme install features' );
			upgradeUrl = `/plans/${ siteSlug }`;
		}

		return (
			<UpsellNudge
				title={ title }
				event="calypso_theme_install_upgrade_click"
				href={ upgradeUrl }
				plan={ upsellPlan }
				feature={ FEATURE_UPLOAD_THEMES }
				showIcon
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
					{ this.props.activeTheme !== theme.id && ! this.props.isThemeTransferCompleted && (
						<Button primary onClick={ this.onActivateClick }>
							{ activate.label }
						</Button>
					) }
				</div>
			</div>
		);
	}

	renderUploadCard() {
		const {
			canUploadThemesOrPlugins,
			complete,
			failed,
			inProgress,
			isJetpack,
			isStandaloneJetpack,
			isAtomic,
			selectedSite,
			uploadedTheme,
		} = this.props;

		const { showEligibility } = this.state;

		const uploadAction = ( siteId, file ) =>
			isJetpack
				? this.props.uploadTheme( siteId, file )
				: this.props.initiateThemeTransfer( siteId, file, '', '', 'theme_upload' );
		const isDisabled =
			! isStandaloneJetpack && ( ! canUploadThemesOrPlugins || ( ! isAtomic && showEligibility ) );

		const WrapperComponent = isDisabled ? FeatureExample : Fragment;

		return (
			<WrapperComponent>
				<Card>
					{ ! inProgress && ! complete && (
						<AsyncLoad
							require="calypso/blocks/upload-drop-zone"
							placeholder={ null }
							doUpload={ uploadAction }
							disabled={ isDisabled }
						/>
					) }
					{ inProgress && this.renderProgressBar() }
					{ complete && ! failed && uploadedTheme && this.renderTheme() }
					{ complete && isAtomic && <WpAdminAutoLogin site={ selectedSite } /> }
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
				illustration="/calypso/images/illustrations/illustration-jetpack.svg"
			/>
		);
	}

	render() {
		const {
			backPath,
			canUploadThemesOrPlugins,
			complete,
			isFetchingPurchases,
			isStandaloneJetpack,
			isMultisite,
			siteId,
			themeId,
			translate,
		} = this.props;

		const showUpgradeBanner =
			! isFetchingPurchases && ! canUploadThemesOrPlugins && ! isStandaloneJetpack;
		const { showEligibility } = this.state;

		if ( isMultisite ) {
			return this.renderNotAvailableForMultisite();
		}

		return (
			<Main className="theme-upload">
				<PageViewTracker path="/themes/upload/:site" title="Themes > Install" />
				<DocumentHead title={ translate( 'Install Theme' ) } />

				<QuerySitePurchases siteId={ siteId } />
				<QueryEligibility siteId={ siteId } />
				<QueryActiveTheme siteId={ siteId } />
				{ themeId && complete && <QueryCanonicalTheme siteId={ siteId } themeId={ themeId } /> }
				<NavigationHeader
					title={ translate( 'Themes' ) }
					subtitle={ translate(
						'If you have a theme in .zip format, you may install or update it by uploading it here. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="themes-upload" showIcon={ false } />
								),
							},
						}
					) }
				></NavigationHeader>

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
	const isAtomic = isSiteWpcomAtomic( state, siteId );
	const isStandaloneJetpack = isJetpack && ! isAtomic;

	const { eligibilityHolds, eligibilityWarnings } = getEligibility( state, siteId );
	// Use this selector to take advantage of eligibility card placeholders
	// before data has loaded.
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const hasEligibilityMessages = ! (
		isEmpty( eligibilityHolds ) && isEmpty( eligibilityWarnings )
	);
	const canUploadThemesOrPlugins =
		siteHasFeature( state, siteId, FEATURE_UPLOAD_THEMES ) ||
		siteHasFeature( state, siteId, FEATURE_UPLOAD_PLUGINS );

	const showEligibility =
		canUploadThemesOrPlugins && ! isAtomic && ( hasEligibilityMessages || ! isEligible );

	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		selectedSite: getSelectedSite( state ),
		isAtomic,
		isCommerceTrial: isSiteOnECommerceTrial( state, siteId ),
		isJetpack,
		isStandaloneJetpack,
		inProgress: isUploadInProgress( state, siteId ),
		complete: isUploadComplete( state, siteId ),
		failed: hasUploadFailed( state, siteId ),
		themeId,
		activeTheme: getActiveTheme( state, siteId ),
		isMultisite: isJetpackSiteMultiSite( state, siteId ),
		uploadedTheme: getCanonicalTheme( state, siteId, themeId ),
		error: getUploadError( state, siteId ),
		progressTotal: getUploadProgressTotal( state, siteId ),
		progressLoaded: getUploadProgressLoaded( state, siteId ),
		installing: isInstallInProgress( state, siteId ),
		backPath: getBackPath( state ),
		isThemeTransferInProgress: isTransferInProgress( state, siteId ),
		isThemeTransferCompleted: isTransferComplete( state, siteId ),
		showEligibility,
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		siteThemeInstallUrl: getSiteThemeInstallUrl( state, siteId ),
		canUploadThemesOrPlugins,
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
