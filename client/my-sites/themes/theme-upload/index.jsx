/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { includes, find, isEmpty, flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import HeaderCake from 'calypso/components/header-cake';
import { Card, ProgressBar, Button } from '@automattic/components';
import UploadDropZone from 'calypso/blocks/upload-drop-zone';
import EmptyContent from 'calypso/components/empty-content';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import AutoLoadingHomepageModal from 'calypso/my-sites/themes/auto-loading-homepage-modal';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
// Necessary for ThanksModal
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { uploadTheme, clearThemeUpload, initiateThemeTransfer } from 'calypso/state/themes/actions';
import {
	getSelectedSiteId,
	getSelectedSite,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import {
	getSiteAdminUrl,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
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
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import { connectOptions } from 'calypso/my-sites/themes/theme-options';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { getBackPath } from 'calypso/state/themes/themes-ui/selectors';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'calypso/lib/plans/constants';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import WpAdminAutoLogin from 'calypso/components/wpadmin-auto-login';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:themes:theme-upload' );

class Upload extends React.Component {
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
				'Install problem: Theme may not be valid. Check that your zip file contains only the theme ' +
					'you are trying to install.'
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
		const { inProgress, failed, uploadedTheme, complete, isJetpack, isBusiness } = this.props;

		const uploadAction = isJetpack ? this.props.uploadTheme : this.props.initiateThemeTransfer;
		const disabled = ! isBusiness && ! isJetpack;

		return (
			<Card>
				{ ! inProgress && ! complete && (
					<UploadDropZone doUpload={ uploadAction } disabled={ disabled } />
				) }
				{ inProgress && this.renderProgressBar() }
				{ complete && ! failed && uploadedTheme && this.renderTheme() }
				{ complete && this.props.isSiteAutomatedTransfer && (
					<WpAdminAutoLogin site={ this.props.selectedSite } />
				) }
			</Card>
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
		const { backPath, complete, isMultisite, siteId, themeId, translate } = this.props;

		const { showEligibility } = this.state;

		if ( isMultisite ) {
			return this.renderNotAvailableForMultisite();
		}

		return (
			<Main>
				<PageViewTracker path="/themes/upload/:site" title="Themes > Install" />
				<QueryEligibility siteId={ siteId } />
				<QueryActiveTheme siteId={ siteId } />
				{ themeId && complete && <QueryCanonicalTheme siteId={ siteId } themeId={ themeId } /> }
				<ThanksModal source="upload" />
				<AutoLoadingHomepageModal source="upload" />
				<HeaderCake backHref={ backPath }>{ translate( 'Install theme' ) }</HeaderCake>
				{ showEligibility && (
					<EligibilityWarnings backUrl={ backPath } onProceed={ this.onProceedClick } />
				) }
				{ ! showEligibility && this.renderUploadCard() }
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
	const site = getSelectedSite( state );
	const themeId = getUploadedThemeId( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
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
		isBusiness: hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ),
		selectedSite: site,
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
		showEligibility: ! isJetpack && ( hasEligibilityMessages || ! isEligible ),
		isSiteAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
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
